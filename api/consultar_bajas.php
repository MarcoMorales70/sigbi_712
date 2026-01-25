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
$permisosRequeridos = [22, 23, 24]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Consultar las bajas
try {
    $stmt = $pdo->query("SELECT id_baja, baja, total_dictamenes, total_bienes FROM bajas");
    $bajas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuestas json
    if (empty($bajas)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen bajas registradas. Redirigiendo a Hardware..."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "bajas" => $bajas
        ]);
    }
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}