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
$permisosRequeridos = [5,7,17,19]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consultar todos los estados
    $stmt = $pdo->prepare("SELECT id_estado, estado, id_entidad FROM estados ORDER BY estado ASC");
    $stmt->execute();
    $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($estados);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar estados: " . $e->getMessage()
    ]);
}