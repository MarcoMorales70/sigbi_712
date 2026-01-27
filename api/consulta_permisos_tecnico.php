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

// Se reciben datos
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "ID técnico requerido"]);
    exit;
}

try {
    // Se consultan todos los permisos
    $sqlPermisos = "SELECT id_permiso, permiso FROM permisos ORDER BY id_permiso ASC";
    $stmtPermisos = $pdo->query($sqlPermisos);
    $permisosDisponibles = [];
    foreach ($stmtPermisos->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $permisosDisponibles[] = [
            "id_permiso" => (int)$row["id_permiso"],
            "nombre"     => $row["permiso"] // Alias para para manejarlo en el frontend
        ];
    }

    // Se consultan los permisos del técnico recibido
    $sqlSel = "SELECT id_permiso FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtSel = $pdo->prepare($sqlSel);
    $stmtSel->execute(["id_tecnico" => $id_tecnico]);
    $permisosSeleccionados = [];
    foreach ($stmtSel->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $permisosSeleccionados[] = (int)$row["id_permiso"];
    }

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "permisos" => $permisosDisponibles,
        "permisosSeleccionados" => $permisosSeleccionados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {     // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}