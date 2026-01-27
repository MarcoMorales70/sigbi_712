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
$permisosRequeridos = [29]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Reciben datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

// Asignación, validación y respuesta
$id_usuario = $data["id_usuario"] ?? "";

if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

// Si el usuario además en un técnico del sistema, también se debe eliminar
try {
    // Eliminar de la tabla usuarios
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);

    // Eliminar de la tabla tecnicos si existe
    $stmtTec = $pdo->prepare("DELETE FROM tecnicos WHERE id_tecnico = ?");
    $stmtTec->execute([$id_usuario]);

    echo json_encode(["status" => "ok", "message" => "Usuario eliminado correctamente."]);
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error al eliminar usuario: " . $e->getMessage()]);
}