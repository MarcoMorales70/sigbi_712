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
$permisosRequeridos = [38]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Leer datos enviados desde el frontend
$input = json_decode(file_get_contents("php://input"), true);

$patch            = $input["patch"] ?? null;
$puerto_pp        = $input["puerto_pp"] ?? null;
$id_estado        = $input["id_estado"] ?? null;
$puerto_sw        = $input["puerto_sw"] ?? null;
$nodo             = $input["nodo"] ?? null;
$serie_bien       = $input["serie_bien"] ?? null;
$notas_puerto_pp  = $input["notas_puerto_pp"] ?? null;

// Validación básica
if (!$patch || !$puerto_pp) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    // Validar existencia de la tabla
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $patch]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(["status" => "error", "message" => "La tabla '$patch' no existe."]);
        exit;
    }

    // Validar existencia del puerto en la tabla
    $stmt = $pdo->prepare("SELECT puerto_pp FROM `$patch` WHERE puerto_pp = :puerto_pp");
    $stmt->execute([":puerto_pp" => $puerto_pp]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(["status" => "error", "message" => "El puerto '$puerto_pp' no existe en la tabla '$patch'."]);
        exit;
    }

    // 3. Actualizar registro
    $update = $pdo->prepare("
        UPDATE `$patch`
        SET id_estado = :id_estado,
            puerto_sw = :puerto_sw,
            nodo = :nodo,
            serie_bien = :serie_bien,
            notas_puerto_pp = :notas_puerto_pp
        WHERE puerto_pp = :puerto_pp
    ");

    $ok = $update->execute([
        ":id_estado"        => $id_estado,
        ":nodo"             => $nodo,
        ":serie_bien"       => $serie_bien,
        ":puerto_pp"        => $puerto_pp,
        ":notas_puerto_pp"  => $notas_puerto_pp,
        ":puerto_sw"        => $puerto_sw
    ]);

    if ($ok) {
        echo json_encode(["status" => "ok", "message" => "Puerto actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el puerto."]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}