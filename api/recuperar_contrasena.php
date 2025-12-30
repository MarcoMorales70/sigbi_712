<?php
require_once __DIR__ . "/cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =========================
header("Content-Type: application/json; charset=UTF-8");<?php
// =========================
// CORS PARA REACT
// =========================
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");

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

$id_tecnico   = $data['id_tecnico'] ?? null;
$codigo_temp  = $data['codigo_temp'] ?? null;

// Normalizar: forzar mayúsculas en el código
$codigo_temp = $codigo_temp ? strtoupper($codigo_temp) : null;

// =========================
// VALIDACIONES BÁSICAS
// =========================
if (!$id_tecnico || !$codigo_temp) {
    echo json_encode([
        "status" => "error",
        "message" => "Debe ingresar ID técnico y código temporal."
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

if (!preg_match("/^[A-Z0-9]{6}$/", $codigo_temp)) {
    echo json_encode([
        "status" => "error",
        "message" => "El código temporal debe tener exactamente 6 caracteres alfanuméricos (A-Z, 0-9)."
    ]);
    exit;
}

// =========================
// CONSULTAR TÉCNICO
// =========================
$sqlTec = "SELECT contrasena, codigo_temp FROM tecnicos WHERE id_tecnico = ?";
$stmtTec = $conn->prepare($sqlTec);

if (!$stmtTec) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor (SQL técnico)."
    ]);
    exit;
}

$stmtTec->bind_param("s", $id_tecnico);
$stmtTec->execute();
$resultTec = $stmtTec->get_result();

if ($resultTec->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "El técnico no existe."
    ]);
    exit;
}

$tec = $resultTec->fetch_assoc();

// Validar existencia de código_temp
if (!isset($tec['codigo_temp']) || $tec['codigo_temp'] === null || $tec['codigo_temp'] === "") {
    echo json_encode([
        "status" => "error",
        "message" => "No hay código temporal asignado. Solicítelo al administrador."
    ]);
    exit;
}

// Comparar código (normalizado en mayúsculas)
if (strtoupper($tec['codigo_temp']) !== $codigo_temp) {
    echo json_encode([
        "status" => "error",
        "message" => "El código temporal no coincide."
    ]);
    exit;
}

// =========================
// SIMULACIÓN DE ENVÍO DE CORREO
// =========================
// Aquí en el futuro se integrará PHPMailer con SMTP.
// Por ahora devolvemos un mensaje de éxito simulado.

echo json_encode([
    "status" => "ok",
    "message" => "Simulación: su contraseña ha sido enviada a su correo institucional."
]);

$stmtTec->close();
$conn->close();
?>
ini_set('display_errors', 0);
error_reporting(0);

include __DIR__ . "/conexion.php";

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico   = $data['id_tecnico'] ?? null;
$codigo_temp  = $data['codigo_temp'] ?? null;

// Normalizar: forzar mayúsculas en el código
$codigo_temp = $codigo_temp ? strtoupper($codigo_temp) : null;

// =========================
// VALIDACIONES BÁSICAS
// =========================
if (!$id_tecnico || !$codigo_temp) {
    echo json_encode([
        "status" => "error",
        "message" => "Debe ingresar ID técnico y código temporal."
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

if (!preg_match("/^[A-Z0-9]{6}$/", $codigo_temp)) {
    echo json_encode([
        "status" => "error",
        "message" => "El código temporal debe tener exactamente 6 caracteres alfanuméricos (A-Z, 0-9)."
    ]);
    exit;
}

// =========================
// CONSULTAR TÉCNICO
// =========================
$sqlTec = "SELECT contrasena, codigo_temp FROM tecnicos WHERE id_tecnico = ?";
$stmtTec = $conn->prepare($sqlTec);

if (!$stmtTec) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor (SQL técnico)."
    ]);
    exit;
}

$stmtTec->bind_param("s", $id_tecnico);
$stmtTec->execute();
$resultTec = $stmtTec->get_result();

if ($resultTec->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "El técnico no existe."
    ]);
    exit;
}

$tec = $resultTec->fetch_assoc();

// Validar existencia de código_temp
if (!isset($tec['codigo_temp']) || $tec['codigo_temp'] === null || $tec['codigo_temp'] === "") {
    echo json_encode([
        "status" => "error",
        "message" => "No hay código temporal asignado. Solicítelo al administrador."
    ]);
    exit;
}

// Comparar código (normalizado en mayúsculas)
if (strtoupper($tec['codigo_temp']) !== $codigo_temp) {
    echo json_encode([
        "status" => "error",
        "message" => "El código temporal no coincide."
    ]);
    exit;
}

// =========================
// OBTENER CORREO DEL USUARIO
// =========================
$sqlUsr = "SELECT correo FROM usuarios WHERE id_usuario = ?";
$stmtUsr = $conn->prepare($sqlUsr);

if (!$stmtUsr) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor (SQL usuario)."
    ]);
    exit;
}

$stmtUsr->bind_param("s", $id_tecnico);
$stmtUsr->execute();
$resultUsr = $stmtUsr->get_result();

if ($resultUsr->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "No se encontró el correo institucional del técnico."
    ]);
    exit;
}

$usr = $resultUsr->fetch_assoc();
$correo = $usr['correo'];

// =========================
// ENVIAR CORREO CON CONTRASEÑA
// =========================
// Nota: Ajusta esta función a tu mecanismo real de correo (PHPMailer, SMTP, etc.)
$asunto = "Recuperación de contraseña";
$mensaje = "Su contraseña es: " . $tec['contrasena'];

$headers = "From: no-reply@institucion.mx\r\n" .
           "Content-Type: text/plain; charset=UTF-8\r\n";

$enviado = mail($correo, $asunto, $mensaje, $headers);

if ($enviado) {
    echo json_encode([
        "status" => "ok",
        "message" => "Su contraseña ha sido enviada a su correo institucional."
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No fue posible enviar el correo. Inténtelo más tarde."
    ]);
}

$stmtTec->close();
$stmtUsr->close();
$conn->close();
?>