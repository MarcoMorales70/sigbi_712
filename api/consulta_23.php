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
$permisosRequeridos = [23]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos y validación inicial
try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id_baja_actual = $input["id_baja_actual"] ?? null;

    if (!$id_baja_actual) {
        echo json_encode(["status" => "error", "message" => "Falta id_baja_actual."]);
        exit;
    }

    // Obtener datos de la baja seleccionada
    $stmtBaja = $pdo->prepare("SELECT baja, total_dictamenes, total_bienes FROM bajas WHERE id_baja = ?");
    $stmtBaja->execute([$id_baja_actual]);
    $bajaData = $stmtBaja->fetch(PDO::FETCH_ASSOC);

    if (!$bajaData) {
        echo json_encode(["status" => "error", "message" => "La baja seleccionada no existe."]);
        exit;
    }

    // Obtener dictámenes asociados a la baja
    $stmtDictamenes = $pdo->prepare("SELECT id_dictamen, cant_bienes FROM dictamenes WHERE id_baja = ?");
    $stmtDictamenes->execute([$id_baja_actual]);
    $dictamenes = $stmtDictamenes->fetchAll(PDO::FETCH_ASSOC);

    // Obtener bienes_dictamen asociados a esos dictámenes
    $bienes = [];
    if (!empty($dictamenes)) {
        $idsDictamen = array_column($dictamenes, "id_dictamen");
        $placeholders = implode(",", array_fill(0, count($idsDictamen), "?"));

        $stmtBienes = $pdo->prepare("SELECT id_dictamen, serie_bien FROM bienes_dictamen WHERE id_dictamen IN ($placeholders)");
        $stmtBienes->execute($idsDictamen);
        $bienes = $stmtBienes->fetchAll(PDO::FETCH_ASSOC);
    }

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "id_baja_actual" => $id_baja_actual,
        "baja_actual" => $bajaData["baja"],
        "total_dictamenes_actual" => $bajaData["total_dictamenes"],
        "total_bienes_actual" => $bajaData["total_bienes"],
        "dictamenes" => $dictamenes,
        "bienes" => $bienes
    ]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}