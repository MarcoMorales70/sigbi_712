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

// Validación de permisos
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [15]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$input = json_decode(file_get_contents("php://input"), true);
$folio = $input["folio"] ?? null;

// Validació de que existe un dato
if (!$folio) {
    echo json_encode(["status" => "error", "message" => "Folio no proporcionado."]);
    exit;
}

try {
    // Verificar que existe la solicitud en la tabla solicitudes
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM solicitudes WHERE folio = :folio");
    $stmt->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stmt->execute();
    $existe = $stmt->fetchColumn();

    // Respuesta si no existe
    if ($existe == 0) {
        echo json_encode(["status" => "error", "message" => "El folio ingresado no existe."]);
        exit;
    }

    // Eliminar la solicitud
    $stmt = $pdo->prepare("DELETE FROM solicitudes WHERE folio = :folio");
    $stmt->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stmt->execute();

    // Respuestas json
    echo json_encode(["status" => "ok", "message" => "Solicitud eliminada correctamente."]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en la eliminación: " . $e->getMessage()]);
}