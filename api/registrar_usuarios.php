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

// Recibir datos y asignarlos a variables
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_usuario   = $data["id_usuario"] ?? "";
$usuario      = $data["usuario"] ?? "";
$a_paterno    = $data["a_paterno"] ?? "";
$a_materno    = $data["a_materno"] ?? "";
$correo       = $data["correo"] ?? "";
$id_cargo     = $data["id_cargo"] ?? "";
$id_direccion = $data["id_direccion"] ?? "";
$id_sede      = $data["id_sede"] ?? "";
$id_edificio  = $data["id_edificio"] ?? "";
$id_nivel     = $data["id_nivel"] ?? "";

// Realizar validaciones no vacias
if (
    empty($id_usuario) || empty($usuario) || empty($a_paterno) || empty($a_materno) ||
    empty($correo) || empty($id_cargo) || empty($id_direccion) || empty($id_sede) ||
    empty($id_edificio) || empty($id_nivel)
) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit;
}

// Consulta para insertar el registro
try {
    $stmt = $pdo->prepare("INSERT INTO usuarios 
        (id_usuario, usuario, a_paterno, a_materno, correo, id_cargo, id_direccion, id_sede, id_edificio, id_nivel) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id_usuario,
        $usuario,
        $a_paterno,
        $a_materno,
        $correo,
        $id_cargo,
        $id_direccion,
        $id_sede,
        $id_edificio,
        $id_nivel
    ]);

    // Respuestas json
    echo json_encode(["status" => "ok", "message" => "Usuario registrado con éxito."]);
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error al registrar usuario: " . $e->getMessage()]);
}