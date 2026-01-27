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
$permisosRequeridos = [28]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir y asignar datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_usuario   = $data["id_usuario"]   ?? "";
$usuario      = $data["usuario"]      ?? "";
$a_paterno    = $data["a_paterno"]    ?? "";
$a_materno    = $data["a_materno"]    ?? "";
$correo       = $data["correo"]       ?? "";
$id_cargo     = $data["id_cargo"]     ?? "";
$id_direccion = $data["id_direccion"] ?? "";
$id_sede      = $data["id_sede"]      ?? "";
$id_edificio  = $data["id_edificio"]  ?? "";
$id_nivel     = $data["id_nivel"]     ?? "";

// Validación de existencia
if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

// Consulta para actualizar datos
try {
    $stmt = $pdo->prepare("UPDATE usuarios 
                           SET usuario = ?, a_paterno = ?, a_materno = ?, correo = ?, 
                               id_cargo = ?, id_direccion = ?, id_sede = ?, id_edificio = ?, id_nivel = ?
                           WHERE id_usuario = ?");
    $ok = $stmt->execute([
        $usuario, $a_paterno, $a_materno, $correo,
        $id_cargo, $id_direccion, $id_sede, $id_edificio, $id_nivel,
        $id_usuario
    ]);

    // Respuestas json
    if ($ok) {
        echo json_encode(["status" => "ok", "message" => "Usuario actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo actualizar el usuario."]);
    }
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}