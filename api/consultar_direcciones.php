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
$permisosRequeridos = [26]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Consulta de direcciones administrativas
try {
    $stmt = $pdo->query("SELECT id_direccion, direccion_a FROM direcciones_admin ORDER BY direccion_a ASC");
    $direcciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Validación de existencia y respuestas json
    if (empty($direcciones)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen direcciones registradas."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "direcciones" => $direcciones
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}