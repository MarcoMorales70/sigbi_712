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
$permisosRequeridos = [12]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Consultar categorías
try {
    $stmt = $pdo->query("SELECT id_categoria, categoria FROM categorias ORDER BY categoria ASC");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Validaciones y respuestas json
    if (empty($categorias)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen categorías registradas."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "categorias" => $categorias
        ]);
    }
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}