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
$permisosRequeridos = [30]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir y asignar valores
$data = json_decode(file_get_contents("php://input"), true);

$nom_switch   = trim($data["nomSwitch"] ?? "");
$serie_sw     = trim($data["serieSw"] ?? "");
$mac_sw       = trim($data["mac"] ?? "");
$puertos      = (int)($data["puertos"] ?? 0);
$id_sede      = $data["idSede"] ?? "";
$id_edificio  = $data["idEdificio"] ?? "";
$id_nivel     = $data["idNivel"] ?? "";
$desc_switch  = trim($data["descSwitch"] ?? "");

// Validaciones no vacías
if (empty($nom_switch) || empty($serie_sw) || empty($mac_sw) || $puertos <= 0 || empty($id_sede) || empty($id_edificio) || empty($id_nivel)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit;
}

// Validar nombre del switch (nomenclatura utilizada por el cliente)
if (!preg_match('/^[a-p1-9_sw]{9}$/', $nom_switch)) {
    echo json_encode(["status" => "error", "message" => "Nombre de switch inválido. Respete la nomenclatura."]);
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

// Validar número de puertos (solo 12, 24 o 48)
if (!in_array($puertos, [12, 24, 48])) {
    echo json_encode([
        "status" => "error",
        "message" => "Número de puertos inválido. Solo se permiten 12, 24 o 48."
    ]);
    exit;
}

// Validar descripción (máximo 255 caracteres)
if (strlen($desc_switch) > 255) {
    echo json_encode(["status" => "error", "message" => "La descripción no puede exceder 255 caracteres."]);
    exit;
}

try {
    // Validar nombre único
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM switches WHERE nom_switch = ?");
    $stmt->execute([$nom_switch]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(["status" => "error", "message" => "El nombre de switch ya existe."]);
        exit;
    }

    // Insertar en switches
    $stmt = $pdo->prepare("INSERT INTO switches (nom_switch, serie_sw, mac_sw, puertos, id_sede, id_edificio, id_nivel, desc_switch)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nom_switch, $serie_sw, $mac_sw, $puertos, $id_sede, $id_edificio, $id_nivel, $desc_switch]);

    // Crear tabla dinámica
    $tableName = preg_replace('/[^a-p0-9_sw]/', '', $nom_switch); // Sanitizar con caracteres válidos
    $pdo->exec("CREATE TABLE `$tableName` (
        id_puerto INT AUTO_INCREMENT PRIMARY KEY,
        puerto_sw VARCHAR(12),
        id_estado INT,
        voz VARCHAR(2),
        datos VARCHAR(2),
        puerto_pp VARCHAR(12),
        notas_puerto_sw VARCHAR(255)
    )");

    // Insertar valores iniciales
    $stmtInsert = $pdo->prepare("INSERT INTO `$tableName` (puerto_sw, id_estado, voz, datos, puerto_pp, notas_puerto_sw)
                                 VALUES (?, NULL, NULL, NULL, NULL, NULL)");

    for ($i = 1; $i <= $puertos; $i++) {
      $puertoName = $nom_switch . "_" . $i;
      $stmtInsert->execute([$puertoName]);
    }

    // Respuesta json
    echo json_encode(["status" => "ok", "message" => "Switch $nom_switch con $puertos puertos registrado con éxito."]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}