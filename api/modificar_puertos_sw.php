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
$permisosRequeridos = [33]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Leer datos enviados desde el frontend
$input = json_decode(file_get_contents("php://input"), true);

$nom_switch       = $input["nom_switch"] ?? null;
$puerto_sw        = $input["puerto_sw"] ?? null;
$id_estado        = $input["id_estado"] ?? null;
$voz              = $input["voz"] ?? null;
$datos            = $input["datos"] ?? null;
$puerto_pp        = $input["puerto_pp"] ?? null;
$notas_puerto_sw  = $input["notas_puerto_sw"] ?? null;

// Validación básica
if (!$nom_switch || !$puerto_sw) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    // 1. Validar existencia de la tabla
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $nom_switch]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(["status" => "error", "message" => "La tabla '$nom_switch' no existe."]);
        exit;
    }

    // 2. Validar existencia del puerto en la tabla
    $stmt = $pdo->prepare("SELECT puerto_sw FROM `$nom_switch` WHERE puerto_sw = :puerto_sw");
    $stmt->execute([":puerto_sw" => $puerto_sw]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(["status" => "error", "message" => "El puerto '$puerto_sw' no existe en la tabla '$nom_switch'."]);
        exit;
    }

    // 3. Actualizar registro
    $update = $pdo->prepare("
        UPDATE `$nom_switch`
        SET id_estado = :id_estado,
            voz = :voz,
            datos = :datos,
            puerto_pp = :puerto_pp,
            notas_puerto_sw = :notas
        WHERE puerto_sw = :puerto_sw
    ");

    $ok = $update->execute([
        ":id_estado" => $id_estado,
        ":voz"       => $voz,
        ":datos"     => $datos,
        ":puerto_pp" => $puerto_pp,
        ":notas"     => $notas_puerto_sw,
        ":puerto_sw" => $puerto_sw
    ]);

    if ($ok) {
        echo json_encode(["status" => "ok", "message" => "Puerto actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el puerto."]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}