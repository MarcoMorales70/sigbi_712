<?php
require_once __DIR__ . "/cors.php";

// Responder preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =========================
// CONFIGURACIÓN PHP
// =========================
ini_set('display_errors', 0);
error_reporting(0);

header("Content-Type: application/json; charset=UTF-8");

include __DIR__ . "/conexion.php";

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico        = $data['id_tecnico'] ?? null;
$contrasena_actual = $data['contrasena_actual'] ?? null;
$contrasena_nueva  = $data['contrasena_nueva'] ?? null;

// =========================
// VALIDACIONES BÁSICAS
// =========================
if (!$id_tecnico || !$contrasena_actual || !$contrasena_nueva) {
    echo json_encode([
        "status" => "error",
        "message" => "Debe ingresar ID técnico, contraseña actual y nueva contraseña."
    ]);
    exit;
}

if (!preg_match("/^\d{7}$/", $id_tecnico)) {
    echo json_encode([
        "status" => "error",
        "message" => "El ID técnico debe contener exactamente 7 dígitos."
    ]);
    exit;
}

if (strlen($contrasena_nueva) < 8) {
    echo json_encode([
        "status" => "error",
        "message" => "La nueva contraseña debe tener al menos 8 caracteres."
    ]);
    exit;
}

// =========================
// CONSULTAR TÉCNICO
// =========================
$sql = "SELECT contrasena, id_estado FROM tecnicos WHERE id_tecnico = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor (SQL)."
    ]);
    exit;
}

$stmt->bind_param("s", $id_tecnico);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "El técnico no existe."
    ]);
    exit;
}

$tecnico = $result->fetch_assoc();

// =========================
// VALIDAR ESTADO DEL TÉCNICO
// =========================
if ((int)$tecnico['id_estado'] !== 6) {
    echo json_encode([
        "status" => "error",
        "message" => "El usuario no está activo. No puede cambiar su contraseña."
    ]);
    exit;
}

// =========================
// VALIDAR CONTRASEÑA ACTUAL
// =========================
if ($contrasena_actual !== $tecnico['contrasena']) {
    echo json_encode([
        "status" => "error",
        "message" => "La contraseña actual no coincide."
    ]);
    exit;
}

// =========================
// ACTUALIZAR CONTRASEÑA
// =========================
$sql_update = "UPDATE tecnicos SET contrasena = ? WHERE id_tecnico = ?";
$stmt_update = $conn->prepare($sql_update);
$stmt_update->bind_param("ss", $contrasena_nueva, $id_tecnico);

if ($stmt_update->execute()) {
    echo json_encode([
        "status" => "ok",
        "message" => "Operación exitosa"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error al actualizar la contraseña."
    ]);
}

$stmt->close();
$stmt_update->close();
$conn->close();
?>