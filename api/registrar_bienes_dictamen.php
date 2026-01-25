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
$permisosRequeridos = [21]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_dictamen = intval($data["id_dictamen"] ?? 0);
$bienes = $data["bienes"] ?? [];

if ($id_dictamen <= 0 || empty($bienes)) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try { // Se necesita completar varias tareas para completar la transacción
    $pdo->beginTransaction();

    // Actualizar estado de bienes seleccionados
    $stmtUpdate = $pdo->prepare("UPDATE bienes SET id_estado = 5 WHERE serie_bien = ?");
    foreach ($bienes as $serie) {
        $stmtUpdate->execute([$serie]);
    }

    // Insertar relación en bienes_dictamen
    $stmtInsert = $pdo->prepare("INSERT INTO bienes_dictamen (serie_bien, id_dictamen) VALUES (?, ?)");
    foreach ($bienes as $serie) {
        $stmtInsert->execute([$serie, $id_dictamen]);
    }

    $pdo->commit();

    // Consultar nuevamente bienes disponibles
    $stmt = $pdo->query("SELECT serie_bien FROM bienes WHERE id_estado = 3");
    $bienesDisponibles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "message" => "Bienes registrados correctamente.",
        "bienes" => $bienesDisponibles
    ]);

} catch (Exception $e) {    // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}