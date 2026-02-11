<?php
// Implementación de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // Aquí debes tener tu $pdo con PDO configurado

// Validación de sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

// Validación de permisos
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [40];
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir dato del frontend
$input = json_decode(file_get_contents("php://input"), true);
$datoIngresado = $input['datoIngresado'] ?? null;

if (!$datoIngresado) {
    echo json_encode(["status" => "error", "message" => "Dato ingresado vacío."]);
    exit;
}

// Obtener primeros 9 caracteres , para saber el switch
$swSeleccionado = substr($datoIngresado, 0, 9);

// Validar existencia en switches
$stmt = $pdo->prepare("SELECT nom_switch FROM switches WHERE nom_switch = ?");
$stmt->execute([$swSeleccionado]);
$switch = $stmt->fetch();

if (!$switch) {
    echo json_encode(["status" => "error", "message" => "Switch no encontrado."]);
    exit;
}

// Validar existencia de tabla $swSeleccionado
$stmt = $pdo->prepare("SHOW TABLES LIKE ?");
$stmt->execute([$swSeleccionado]);
if (!$stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Tabla $swSeleccionado no existe."]);
    exit;
}

// Buscar datoIngresado en esa tabla
$stmt = $pdo->prepare("SELECT puerto_pp FROM $swSeleccionado WHERE puerto_sw = ?");
$stmt->execute([$datoIngresado]);
$row = $stmt->fetch();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "Puerto SW no encontrado."]);
    exit;
}

$datoPuertoPp = $row['puerto_pp'] ?? null;

if (!$datoPuertoPp) {
    echo json_encode(["status" => "error", "message" => "Puerto PP vacío."]);
    exit;
}

// Obtener primeros 9 caracteres de puerto_pp
$ppSeleccionado = substr($datoPuertoPp, 0, 9);

// Validar existencia en patch_panels
$stmt = $pdo->prepare("SELECT patch FROM patch_panels WHERE patch = ?");
$stmt->execute([$ppSeleccionado]);
if (!$stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Patch panel no encontrado."]);
    exit;
}

// Validar existencia de tabla $ppSeleccionado
$stmt = $pdo->prepare("SHOW TABLES LIKE ?");
$stmt->execute([$ppSeleccionado]);
if (!$stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Tabla $ppSeleccionado no existe."]);
    exit;
}

// Validar mapeo de red
$stmt = $pdo->prepare("SELECT puerto_sw, nodo, serie_bien FROM $ppSeleccionado WHERE puerto_pp = ?");
$stmt->execute([$datoPuertoPp]);
$row = $stmt->fetch();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "Puerto PP no encontrado en $ppSeleccionado."]);
    exit;
}

$datoPuertoSw = $row['puerto_sw'] ?? null;
$nodo = $row['nodo'] ?? null;
$serieBien = $row['serie_bien'] ?? null;

if (!$datoPuertoSw) {
    echo json_encode(["status" => "error", "message" => "Puerto SW vacío en $ppSeleccionado."]);
    exit;
}

if ($datoPuertoSw !== $datoIngresado) {
    echo json_encode(["status" => "error", "message" => "Inconsistencias en el mapeo de red."]);
    exit;
}

// Buscar en bienes
$stmt = $pdo->prepare("SELECT id_ip, id_tipo, id_uso FROM bienes WHERE serie_bien = ?");
$stmt->execute([$serieBien]);
$row = $stmt->fetch();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "Bien no encontrado."]);
    exit;
}

$idIp = $row['id_ip'];
$idTipo = $row['id_tipo'];
$idUso = $row['id_uso'];

// Buscar IP
$stmt = $pdo->prepare("SELECT ip FROM ips WHERE id_ip = ?");
$stmt->execute([$idIp]);
$row = $stmt->fetch();
$ip = $row['ip'] ?? null;

// Buscar Usuario
$stmt = $pdo->prepare("SELECT usuario, a_paterno, a_materno FROM usuarios WHERE id_usuario = ?");
$stmt->execute([$idUso]);
$row = $stmt->fetch();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado."]);
    exit;
}

$usuario = $row['usuario'] ?? null;
$aPaterno = $row['a_paterno'] ?? null;
$aMaterno = $row['a_materno'] ?? null;

// Buscar Tipo de Bien
$stmt = $pdo->prepare("SELECT tipo_bien FROM tipo_bienes WHERE id_tipo = ?");
$stmt->execute([$idTipo]);
$row = $stmt->fetch();
$tipoBien = $row['tipo_bien'] ?? null;

// Respuesta final
echo json_encode([
    "status" => "ok",
    "resultado" => [
        "datoPuertoSw" => $datoPuertoSw,
        "datoPuertoPp" => $datoPuertoPp,
        "nodo" => $nodo,
        "tipoBien" => $tipoBien,
        "serieBien" => $serieBien,
        "ip" => $ip,
        "usuario" => $usuario,
        "aPaterno" => $aPaterno,
        "aMaterno" => $aMaterno
    ]
]);