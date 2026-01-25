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

$baja = trim($data["baja"] ?? "");

if ($baja === "") {
    echo json_encode(["status" => "error", "message" => "Falta parámetro 'baja'."]);
    exit;
}

try {
    // Consultar bienes disponibles (id_estado = 3)
    $stmt = $pdo->prepare("SELECT serie_bien FROM bienes WHERE id_estado = 3");
    $stmt->execute();
    $bienes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Consultar los dictámenes de la baja
    $stmt = $pdo->prepare("SELECT id_dictamen, cant_bienes FROM dictamenes d
                           INNER JOIN bajas b ON d.id_baja = b.id_baja
                           WHERE b.baja = ?");
    $stmt->execute([$baja]);
    $dictamenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "bienes" => $bienes,
        "dictamenes" => $dictamenes
    ]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}