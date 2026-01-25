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
if (!in_array(26, $permisos)) { // 26 = ID del permiso "Registrar usuarios"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT id_sede, acronimo, ubicacion FROM sedes ORDER BY acronimo ASC");
    $sedes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($sedes)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen sedes registradas."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "sedes" => $sedes
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}