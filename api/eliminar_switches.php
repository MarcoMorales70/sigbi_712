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
$permisosRequeridos = [34]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);
$nom_switch = $data['nom_switch'] ?? null;

// Validación de existencia
if (!$nom_switch) {
    echo json_encode(["status" => "error", "message" => "Nombre del switch no proporcionado."]);
    exit;
}

try {
    // Consultar que el switch exista en la tabla switches
    $stmt = $pdo->prepare("SELECT * FROM switches WHERE nom_switch = :nom_switch");
    $stmt->execute(["nom_switch" => $nom_switch]);
    $switch = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validación de existencia del switch en la tabla switches 
    if (!$switch) {
        echo json_encode(["status" => "error", "message" => "El switch '$nom_switch' no existe en la tabla switches."]);
        exit;
    }
 
    // Consultar que exista la tabla con el nombre del switch
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute(["tabla" => $nom_switch]);
    $tablaExiste = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validación de existencia
    if (!$tablaExiste) {
        echo json_encode(["status" => "error", "message" => "La tabla '$nom_switch' no existe en la base de datos."]);
        exit;
    }

    // Si ambas partes existen
    // Eliminar el registro de la tabla switches
    $stmt = $pdo->prepare("DELETE FROM switches WHERE nom_switch = :nom_switch");
    $stmt->execute(["nom_switch" => $nom_switch]);

    // Eliminar la tabla con el nombre del switch
    $pdo->exec("DROP TABLE IF EXISTS `$nom_switch`");

    // Si ambas operaciones se ejecutan correctamente
    echo json_encode(["status" => "ok", "message" => "Switch y tabla eliminados correctamente."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la eliminación: " . $e->getMessage()]);
}