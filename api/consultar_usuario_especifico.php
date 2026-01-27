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
$permisosRequeridos = [28, 29]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_usuario = $data["id_usuario"] ?? "";

// Validaciones y respuestas
if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

// Consulta de datos del usuario específico
try {
    $stmt = $pdo->prepare("SELECT id_usuario, usuario, a_paterno, a_materno, correo, id_cargo, id_direccion, id_sede, id_edificio, id_nivel 
                           FROM usuarios 
                           WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validaciones y respuestas json
    if ($usuario) {
        echo json_encode([
            "status" => "ok",
            "usuario" => $usuario
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Usuario no encontrado."
        ]);
    }
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}