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
include __DIR__ . "/conexion.php";

// Validar sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
$permisosPermitidos = [5, 7, 17, 19]; // Permisos válidos para utilizar esta api

if (count(array_intersect($permisosPermitidos, $permisos)) === 0) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT id_entidad, entidad FROM entidades ORDER BY entidad ASC");
    $entidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "ok",
        "entidades" => $entidades
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar entidades: " . $e->getMessage()
    ]);
}