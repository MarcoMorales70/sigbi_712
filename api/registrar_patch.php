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
$permisosRequeridos = [35]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir y asignar valores
$data = json_decode(file_get_contents("php://input"), true);

$patch   = trim($data["patch"] ?? "");
$puertos      = (int)($data["puertos"] ?? 0);
$id_sede      = $data["idSede"] ?? "";
$id_edificio  = $data["idEdificio"] ?? "";
$id_nivel     = $data["idNivel"] ?? "";
$desc_patch  = trim($data["descPatch"] ?? "");

// Validaciones no vacías
if (empty($patch) || $puertos <= 0 || empty($id_sede) || empty($id_edificio) || empty($id_nivel)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit;
}

// Validar nombre del patch (nomenclatura utilizada por el cliente)
if (!preg_match('/^[a-p1-9_sw]{9}$/', $patch)) {
    echo json_encode(["status" => "error", "message" => "Nombre de patch panel inválido. Respete la nomenclatura."]);
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
if (strlen($desc_patch) > 255) {
    echo json_encode(["status" => "error", "message" => "La descripción no puede exceder 255 caracteres."]);
    exit;
}

try {
    // Validar nombre único
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM patch_panels WHERE patch = ?");
    $stmt->execute([$patch]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(["status" => "error", "message" => "El nombre de patch panel ya existe."]);
        exit;
    }

    // Insertar en patch_panels
    $stmt = $pdo->prepare("INSERT INTO patch_panels (patch, puertos, id_sede, id_edificio, id_nivel, desc_patch)
                           VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patch, $puertos, $id_sede, $id_edificio, $id_nivel, $desc_patch]);

    // Crear tabla dinámica
    $tableName = preg_replace('/[^a-p0-9_sw]/', '', $patch); // Sanitizar con caracteres válidos y asignar el nombre de la tabla
    $pdo->exec("CREATE TABLE `$tableName` (
        id_puerto INT AUTO_INCREMENT PRIMARY KEY,
        puerto_pp VARCHAR(12),
        id_estado INT,
        puerto_sw VARCHAR(12),
        nodo int,
        serie_bien VARCHAR(50),
        notas_puerto_pp VARCHAR(255)
    )");

    // Insertar valores iniciales
    $stmtInsert = $pdo->prepare("INSERT INTO `$tableName` (puerto_pp, id_estado, puerto_sw, nodo, serie_bien, notas_puerto_pp)
                                 VALUES (?, NULL, NULL, NULL, NULL, NULL)");

    for ($i = 1; $i <= $puertos; $i++) {
      $puertoName = $patch . "_" . $i;
      $stmtInsert->execute([$puertoName]);
    }

    // Respuesta json
    echo json_encode(["status" => "ok", "message" => "Patch Panel $patch con $puertos puertos registrado con éxito."]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}