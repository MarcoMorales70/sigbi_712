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
$permisosRequeridos = [23, 25]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibe datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);
$serieBien = $data["serie_bien"] ?? "";

if (empty($serieBien)) {
    echo json_encode(["status" => "error", "message" => "Serie del bien no proporcionada."]);
    exit;
}

try {
    $pdo->beginTransaction(); // Se necesita completar este bloque transacciones para poder avanzar

    // Buscar en bienes_dictamen
    $stmt = $pdo->prepare("SELECT id_dictamen FROM bienes_dictamen WHERE serie_bien = ?");
    $stmt->execute([$serieBien]);
    $idDictamen = $stmt->fetchColumn();
    if (!$idDictamen) {
        throw new Exception("La serie ingresada no se encuentra en ninguna baja actual.");
    }

    // Buscar dictamen
    $stmt = $pdo->prepare("SELECT id_baja, cant_bienes FROM dictamenes WHERE id_dictamen = ?");
    $stmt->execute([$idDictamen]);
    $dictamen = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$dictamen) {
        throw new Exception("El bien no pertenece a ningún dictamen.");
    }
    $idBaja = $dictamen["id_baja"];
    $cantBienes = (int)$dictamen["cant_bienes"];

    // Buscar baja
    $stmt = $pdo->prepare("SELECT baja, total_dictamenes, total_bienes FROM bajas WHERE id_baja = ?");
    $stmt->execute([$idBaja]);
    $baja = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$baja) {
        throw new Exception("La baja del bien no existe.");
    }
    $totalDictamenes = (int)$baja["total_dictamenes"];
    $totalBienes = (int)$baja["total_bienes"];

    // Actualizar bienes
    $stmt = $pdo->prepare("UPDATE bienes SET id_estado = 1, id_ip = NULL WHERE serie_bien = ?");
    $stmt->execute([$serieBien]);

    // Eliminar de bienes_dictamen
    $stmt = $pdo->prepare("DELETE FROM bienes_dictamen WHERE serie_bien = ?");
    $stmt->execute([$serieBien]);

    // Validaciones de cant_bienes
    if ($cantBienes == 1) {
        if ($totalDictamenes == 1) {
            // Eliminar la baja completa
            $stmt = $pdo->prepare("DELETE FROM bajas WHERE id_baja = ?");
            $stmt->execute([$idBaja]);
        } else {
            // Restar dictámenes y bienes
            $stmt = $pdo->prepare("UPDATE bajas SET total_dictamenes = total_dictamenes - 1, total_bienes = total_bienes - 1 WHERE id_baja = ?");
            $stmt->execute([$idBaja]);
        }
        // Eliminar dictamen
        $stmt = $pdo->prepare("DELETE FROM dictamenes WHERE id_dictamen = ?");
        $stmt->execute([$idDictamen]);
    } else {
        // Restar bienes en dictamen
        $stmt = $pdo->prepare("UPDATE dictamenes SET cant_bienes = cant_bienes - 1 WHERE id_dictamen = ?");
        $stmt->execute([$idDictamen]);
        // Restar bienes en baja
        $stmt = $pdo->prepare("UPDATE bajas SET total_bienes = total_bienes - 1 WHERE id_baja = ?");
        $stmt->execute([$idBaja]);
    }

    $pdo->commit(); // Fin de las transacciones
    echo json_encode(["status" => "ok", "message" => "Bien reactivado con éxito. Ahora está activo."]);

} catch (Exception $e) {    // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}