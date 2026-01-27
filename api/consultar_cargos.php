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

// Generar consulta de los cargos
try {
    $stmt = $pdo->query("SELECT id_cargo, cargo FROM cargos ORDER BY cargo ASC");
    $cargos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Validaciones y respuestas json
    if (empty($cargos)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen cargos registrados."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "cargos" => $cargos
        ]);
    }
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}