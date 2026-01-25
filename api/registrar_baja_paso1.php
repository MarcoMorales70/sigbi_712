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
$total_dictamenes = intval($data["total_dictamenes"] ?? 0);
$total_bienes = intval($data["total_bienes"] ?? 0);

if ($baja === "" || $total_dictamenes <= 0 || $total_bienes <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Todos los campos son obligatorios y deben ser válidos."
    ]);
    exit;
}

try {
    // Consultar existencia de la baja
    $stmt = $pdo->prepare("SELECT id_baja FROM bajas WHERE baja = ?");
    $stmt->execute([$baja]);
    $existe = $stmt->fetch(PDO::FETCH_ASSOC);

    // Respuesta json en caso de existencia de la baja
    if ($existe) {
        echo json_encode([
            "status" => "error",
            "message" => "La baja ya existe en la base de datos."
        ]);
        exit;
    }

    // Si no existe insertar nueva baja
    $stmt = $pdo->prepare("INSERT INTO bajas (baja, total_dictamenes, total_bienes) VALUES (?, ?, ?)");
    $ok = $stmt->execute([$baja, $total_dictamenes, $total_bienes]);

    // Respuestas json
    if ($ok) {
        echo json_encode([
            "status" => "ok",
            "message" => "Baja registrada correctamente.",
            "id_baja" => $pdo->lastInsertId()
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al registrar la baja."
        ]);
    }

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}