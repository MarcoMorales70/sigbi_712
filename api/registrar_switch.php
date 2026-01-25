<?php
require_once __DIR__ . "/cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php";

if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [30];
if (empty(array_intersect($permisosRequeridos, $permisos))) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$nom_switch   = trim($data["nomSwitch"] ?? "");
$serie_sw     = trim($data["serieSw"] ?? "");
$mac_sw       = trim($data["mac"] ?? "");
$puertos      = (int)($data["puertos"] ?? 0);
$id_sede      = $data["idSede"] ?? "";
$id_edificio  = $data["idEdificio"] ?? "";
$id_nivel     = $data["idNivel"] ?? "";
$desc_switch  = trim($data["descSwitch"] ?? "");

// 🔎 Validaciones adicionales
if (empty($nom_switch) || empty($serie_sw) || empty($mac_sw) || $puertos <= 0 || empty($id_sede) || empty($id_edificio) || empty($id_nivel)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit;
}

// Validar nombre del switch (solo letras, números y guiones bajos, entre 3 y 30 caracteres)
if (!preg_match('/^[a-z0-9_]{3,30}$/', $nom_switch)) {
    echo json_encode(["status" => "error", "message" => "Nombre de switch inválido. Use solo letras minúsculas, números y guiones bajos."]);
    exit;
}

// Validar serie (máximo 20 caracteres alfanuméricos)
if (!preg_match('/^[A-Z0-9]{3,20}$/', $serie_sw)) {
    echo json_encode(["status" => "error", "message" => "Serie inválida. Use solo letras mayúsculas y números (máx. 20 caracteres)."]);
    exit;
}

// Validar MAC (formato AA:BB:CC:DD:EE:FF)
if (!preg_match('/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/', $mac_sw)) {
    echo json_encode(["status" => "error", "message" => "Formato de MAC inválido. Ejemplo válido: AA:BB:CC:DD:EE:FF"]);
    exit;
}

// Validar número de puertos (entre 1 y 96, por ejemplo)
if ($puertos < 1 || $puertos > 96) {
    echo json_encode(["status" => "error", "message" => "Número de puertos inválido. Debe estar entre 1 y 96."]);
    exit;
}

// Validar descripción (máximo 255 caracteres)
if (strlen($desc_switch) > 255) {
    echo json_encode(["status" => "error", "message" => "La descripción no puede exceder 255 caracteres."]);
    exit;
}

try {
    // Paso 1: validar nombre único
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM switches WHERE nom_switch = ?");
    $stmt->execute([$nom_switch]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(["status" => "error", "message" => "El nombre de switch ya existe."]);
        exit;
    }

    // Paso 2: insertar en switches
    $stmt = $pdo->prepare("INSERT INTO switches (nom_switch, serie_sw, mac_sw, puertos, id_sede, id_edificio, id_nivel, desc_switch)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nom_switch, $serie_sw, $mac_sw, $puertos, $id_sede, $id_edificio, $id_nivel, $desc_switch]);

    // Paso 3: crear tabla dinámica
    $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $nom_switch); // sanitizar
    $pdo->exec("CREATE TABLE `$tableName` (
        puerto_sw VARCHAR(12),
        estado VARCHAR(12),
        voz VARCHAR(2),
        datos VARCHAR(2),
        puerto_pp VARCHAR(12),
        notas_puerto_sw VARCHAR(255)
    )");

    $stmtInsert = $pdo->prepare("INSERT INTO `$tableName` (puerto_sw, estado, voz, datos, puerto_pp, notas_puerto_sw)
                                 VALUES (?, NULL, NULL, NULL, NULL, NULL)");

    for ($i = $puertos; $i >= 1; $i--) {
        $puertoName = $nom_switch . "_" . $i;
        $stmtInsert->execute([$puertoName]);
    }

    echo json_encode(["status" => "ok", "message" => "Switch $nom_switch con $puertos puertos registrado con éxito."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}