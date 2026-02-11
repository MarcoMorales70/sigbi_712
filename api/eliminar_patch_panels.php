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
$permisosRequeridos = [39]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);
$patch = $data['patch'] ?? null;

// Validación de existencia
if (!$patch) {
    echo json_encode(["status" => "error", "message" => "Nombre del patch panel no proporcionado."]);
    exit;
}

try {
    // Consultar que el patch panel exista en la tabla patch_panels
    $stmt = $pdo->prepare("SELECT * FROM patch_panels WHERE patch = :patch");
    $stmt->execute(["patch" => $patch]);
    $patchExis = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validación de existencia del patch panel en la tabla patch_panels 
    if (!$patchExis) {
        echo json_encode(["status" => "error", "message" => "El patch panel '$patch' no existe en la tabla patch_panels."]);
        exit;
    }
 
    // Consultar que exista la tabla con el nombre del patch panel
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute(["tabla" => $patch]);
    $tablaExiste = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validación de existencia
    if (!$tablaExiste) {
        echo json_encode(["status" => "error", "message" => "La tabla '$patch' no existe en la base de datos."]);
        exit;
    }

    // Si ambas partes existen
    // Eliminar el registro de la tabla patch_panels
    $stmt = $pdo->prepare("DELETE FROM patch_panels WHERE patch = :patch");
    $stmt->execute(["patch" => $patch]);

    // Eliminar la tabla con el nombre del patch panel
    $pdo->exec("DROP TABLE IF EXISTS `$patch`");

    // Si ambas operaciones se ejecutan correctamente
    echo json_encode(["status" => "ok", "message" => "Patch panel y tabla eliminados correctamente."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la eliminación: " . $e->getMessage()]);
}