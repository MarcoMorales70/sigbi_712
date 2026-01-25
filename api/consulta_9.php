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
$permisosRequeridos = [9]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar un ID técnico."]);
    exit;
}

try {
    // Consultar técnico
    $sql = "SELECT t.id_tecnico, t.id_rol, r.rol AS nombre_rol, t.id_estado, e.estado AS nombre_estado
            FROM tecnicos t
            INNER JOIN roles r ON t.id_rol = r.id_rol
            INNER JOIN estados e ON t.id_estado = e.id_estado
            WHERE t.id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "El técnico no existe."]);
        exit;
    }

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "tecnico" => $tecnico,
        "message" => "Técnico encontrado. Confirme si desea eliminar."
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}