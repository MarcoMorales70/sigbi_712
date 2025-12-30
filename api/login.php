<?php
require_once __DIR__ . "/cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
include __DIR__ . "/conexion.php";

// =========================
// INICIAR SESIÓN PHP
// =========================
session_start();

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;
$contrasena = $data['contrasena'] ?? null;

if (!$id_tecnico || !$contrasena) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar usuario y contraseña."]);
    exit;
}

// =========================
// CONSULTA PRINCIPAL
// =========================
$sql = "SELECT t.id_tecnico, t.contrasena, t.id_estado, t.id_rol, t.id_categoria,
               u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
               u.id_cargo, u.id_direccion, u.id_sede, u.id_edificio, u.id_nivel,
               r.rol, c.categoria
        FROM tecnicos t
        INNER JOIN usuarios u ON u.id_usuario = t.id_tecnico
        INNER JOIN roles r ON r.id_rol = t.id_rol
        INNER JOIN categorias c ON c.id_categoria = t.id_categoria
        WHERE t.id_tecnico = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_tecnico);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "El usuario no existe."]);
    exit;
}

$tecnico = $result->fetch_assoc();

// =========================
// VALIDAR CONTRASEÑA
// =========================
if ($contrasena !== $tecnico['contrasena']) {
    echo json_encode(["status" => "error", "message" => "Contraseña incorrecta."]);
    exit;
}

// =========================
// VALIDAR ESTADO
// =========================
if ((int)$tecnico['id_estado'] !== 6) {
    echo json_encode(["status" => "error", "message" => "El usuario está inactivo."]);
    exit;
}

// =========================
// ARMAR IDENTIDAD
// =========================
$nombre_completo = trim($tecnico['usuario'] . ' ' . $tecnico['a_paterno'] . ' ' . $tecnico['a_materno']);

$identidad = [
    "id_tecnico"   => (int)$tecnico['id_tecnico'],
    "id_usuario"   => (int)$tecnico['id_usuario'],
    "nombre"       => $nombre_completo,
    "correo"       => $tecnico['correo'],
    "rol"          => $tecnico['rol'],
    "id_rol"       => (int)$tecnico['id_rol'],
    "id_categoria" => (int)$tecnico['id_categoria'],
    "categoria"    => $tecnico['categoria'],
    "id_cargo"     => (int)$tecnico['id_cargo'],
    "id_direccion" => (int)$tecnico['id_direccion'],
    "id_sede"      => (int)$tecnico['id_sede'],
    "id_edificio"  => (int)$tecnico['id_edificio'],
    "id_nivel"     => (int)$tecnico['id_nivel']
];

// =========================
// OBTENER PERMISOS
// =========================
$sqlPerm = "SELECT id_permiso FROM permisos_tecnico WHERE id_tecnico = ?";
$stmtPerm = $conn->prepare($sqlPerm);
$stmtPerm->bind_param("i", $id_tecnico);
$stmtPerm->execute();
$resPerm = $stmtPerm->get_result();

$permisos = [];
while ($row = $resPerm->fetch_assoc()) {
    $permisos[] = (int)$row['id_permiso'];
}

// =========================
// GUARDAR EN SESIÓN PHP
// =========================
$_SESSION['identidad'] = $identidad;
$_SESSION['permisos'] = $permisos;

// =========================
// RESPUESTA FINAL
// =========================
echo json_encode([
    "status" => "ok",
    "message" => "Inicio de sesión exitoso.",
    "identidad" => $identidad,
    "permisos" => $permisos
], JSON_UNESCAPED_UNICODE);
exit;