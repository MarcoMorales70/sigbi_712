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
$permisosRequeridos = [7];  
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Validar dato que envia el frontend
$idTecnico = $_GET['id_tecnico'] ?? null;

if (!$idTecnico || !is_numeric($idTecnico)) {
    echo json_encode(["status" => "error", "message" => "Parámetro id_tecnico inválido."]);
    exit;
}

// Se genera la consulta
try {
    $sql = "SELECT 
                t.id_tecnico,
                t.id_rol,
                t.id_categoria,
                t.id_estado
            FROM tecnicos t
            WHERE t.id_tecnico = :id_tecnico
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":id_tecnico", $idTecnico, PDO::PARAM_INT);
    $stmt->execute();

    // Se crea objeto
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    // Respuestas json
    if ($tecnico) {
        echo json_encode(["status" => "ok", "data" => $tecnico]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontró el técnico especificado."]);
    }

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $e->getMessage()]);
}