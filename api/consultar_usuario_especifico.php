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
include __DIR__ . "/conexion.php"; // con PDO

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(29, $permisos)) { // 29 = ID del permiso "Eliminar Usuarios"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// =========================
// OBTENER DATOS DEL USUARIO
// =========================
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);


$id_usuario = $data["id_usuario"] ?? "";

if (empty($id_usuario)) {
    echo json_encode(["status" => "error", "message" => "Debe proporcionar el id_usuario."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id_usuario, usuario, a_paterno, a_materno, correo, id_cargo, id_direccion, id_sede, id_edificio, id_nivel 
                           FROM usuarios 
                           WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

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
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}