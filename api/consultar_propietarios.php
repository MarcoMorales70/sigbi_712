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
$permisosRequeridos = [17]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consulta para obtenet todos los propietarios
    $stmt = $pdo->query("SELECT id_propietario, propietario FROM propietarios ORDER BY propietario ASC");
    $propietarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($propietarios);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar propietarios: " . $e->getMessage()
    ]);
}