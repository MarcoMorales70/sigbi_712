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

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "ID técnico requerido"]);
    exit;
}

try {
    // Consulta para buscar al técnico
    $sqlTec = "SELECT id_tecnico, id_rol, id_categoria, id_estado 
               FROM tecnicos 
               WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sqlTec);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "Técnico no encontrado"]);
        exit;
    }

    // Consulta para obtener lo roles
    $sqlRoles = "SELECT id_rol, rol FROM roles ORDER BY rol ASC";
    $stmtRoles = $pdo->query($sqlRoles);
    $roles = $stmtRoles->fetchAll(PDO::FETCH_ASSOC);

    // Consulta para obtener los estados
    $sqlEstados = "SELECT id_estado, estado, id_entidad 
                   FROM estados 
                   ORDER BY estado ASC";
    $stmtEstados = $pdo->query($sqlEstados);
    $estados = $stmtEstados->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "tecnico" => $tecnico,
        "roles" => $roles,
        "estados" => $estados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}