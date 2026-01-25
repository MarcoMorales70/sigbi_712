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

// Consulta de cuantos bienes son suseptibles a baja (solo los que tengan estado 3: "Dañados para baja")
try {
    $sql = "SELECT COUNT(*) AS total FROM bienes WHERE id_estado = 3";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

// Respuesta json
    echo json_encode([
        "status" => "ok",
        "bienesEdo3" => intval($row["total"])
    ]);
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}