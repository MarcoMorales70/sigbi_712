<?php

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // Con PDO definido

// Se valida el inicio de sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

// Validación de permisos que tiene el usuario para usar esta api
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [24]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos, conversión y validación
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_baja = intval($data["id_baja_seleccionado"] ?? 0);
$baja = $data["baja_seleccionada"] ?? "";

if ($id_baja <= 0 || empty($baja)) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    $pdo->beginTransaction(); // Iniciar transacción

    // Validar baja
    $stmt = $pdo->prepare("SELECT * FROM bajas WHERE id_baja = ? AND baja = ?");
    $stmt->execute([$id_baja, $baja]);
    $rowBaja = $stmt->fetch();
    if (!$rowBaja) {
        throw new Exception("La baja seleccionada no existe.");
    }

    // Validar dictámenes
    $stmt = $pdo->prepare("SELECT id_dictamen FROM dictamenes WHERE id_baja = ?");
    $stmt->execute([$id_baja]);
    $arrayDictamenesBaja = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (empty($arrayDictamenesBaja)) {
        throw new Exception("No existen dictámenes asociados a la baja.");
    }

    // Validar bienes_dictamen
    $arraySerieBienBaja = [];
    foreach ($arrayDictamenesBaja as $id_dictamen) {
        $stmt = $pdo->prepare("SELECT serie_bien FROM bienes_dictamen WHERE id_dictamen = ?");
        $stmt->execute([$id_dictamen]);
        $series = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($series)) {
            throw new Exception("El dictamen $id_dictamen no tiene bienes asociados.");
        }
        $arraySerieBienBaja = array_merge($arraySerieBienBaja, $series);
    }

    // Validar bienes con estado = 5 , que en el array enviado todos esten etiquetados como baja, de lo contrario no se pueden eliminar
    foreach ($arraySerieBienBaja as $serie) {
        $stmt = $pdo->prepare("SELECT id_estado FROM bienes WHERE serie_bien = ?");
        $stmt->execute([$serie]);
        $estado = $stmt->fetchColumn();
        if ($estado != 5) {
            throw new Exception("El bien $serie no está en estado de baja.");
        }
    }

    // Si todas las validaciones pasan, eliminar registros
    $stmt = $pdo->prepare("DELETE FROM bajas WHERE id_baja = ? AND baja = ?");
    $stmt->execute([$id_baja, $baja]);

    $stmt = $pdo->prepare("DELETE FROM dictamenes WHERE id_baja = ?");
    $stmt->execute([$id_baja]);

    foreach ($arrayDictamenesBaja as $id_dictamen) {
        $stmt = $pdo->prepare("DELETE FROM bienes_dictamen WHERE id_dictamen = ?");
        $stmt->execute([$id_dictamen]);
    }

    // No se eliminar los bienes de la tabla "bienes" solo se les coloca un estado que para el cliente es identificativo
    foreach ($arraySerieBienBaja as $serie) {
        $stmt = $pdo->prepare("UPDATE bienes SET id_estado = 22 WHERE serie_bien = ?");
        $stmt->execute([$serie]);
    }

    $pdo->commit(); 

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "message" => "Baja eliminada con éxito. Redirigiendo a Hardware..."
    ]);

} catch (Exception $e) {    // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}