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

// Se reciben los datos
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar un ID técnico."]);
    exit;
}

try {

    $pdo->beginTransaction();  // Su aplicación en este caso es especial, ya que se requiere que se apliquen todos los cambios o ninguno, para evitar datos incompletos

    // 1. Eliminar permisos asociados
    $sqlPerm = "DELETE FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtPerm = $pdo->prepare($sqlPerm);
    $stmtPerm->execute(["id_tecnico" => $id_tecnico]);

    // 2. Eliminar técnico
    $sqlTec = "DELETE FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmtTec = $pdo->prepare($sqlTec);
    $stmtTec->execute(["id_tecnico" => $id_tecnico]);

    $pdo->commit();  // Se confirman todos los cambios

    echo json_encode([
        "status" => "ok",
        "message" => "Técnico y permisos eliminados correctamente."
    ]);

} catch (PDOException $e) { // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar técnico: " . $e->getMessage()
    ]);
}