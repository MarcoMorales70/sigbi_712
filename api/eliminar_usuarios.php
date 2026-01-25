<?php
require_once __DIR__ . "/cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // con PDO definido

if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(29, $permisos)) { // 29 = ID del permiso "Eliminar usuarios"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$id_usuario = $data["id_usuario"] ?? "";

if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

try {
    // Eliminar de la tabla usuarios
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);

    // Eliminar de la tabla tecnicos si existe
    $stmtTec = $pdo->prepare("DELETE FROM tecnicos WHERE id_tecnico = ?");
    $stmtTec->execute([$id_usuario]);

    echo json_encode(["status" => "ok", "message" => "Usuario eliminado correctamente."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error al eliminar usuario: " . $e->getMessage()]);
}