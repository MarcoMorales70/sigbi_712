<?php
require_once __DIR__ . "/cors.php";

// =========================
// MANEJO DE PRE-FLIGHT CORS
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // aquí ya tienes $pdo definido

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(28, $permisos)) { // 28 id_permiso "Modificar Usuarios"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// =========================
// OBTENER DATOS DEL BODY
// =========================
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

if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

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

    if ($ok) {
        echo json_encode(["status" => "ok", "message" => "Usuario actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo actualizar el usuario."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}