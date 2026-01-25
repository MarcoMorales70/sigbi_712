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
    $stmt = $pdo->query("SELECT id_nivel, nivel FROM niveles ORDER BY nivel ASC");
    $niveles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($niveles)) {
        echo json_encode([
            "status" => "error",
            "message" => "No existen niveles registrados."
        ]);
    } else {
        echo json_encode([
            "status" => "ok",
            "niveles" => $niveles
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}