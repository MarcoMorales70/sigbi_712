<?php

// Implementación de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // Con PDO definido

// Validación de sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

// Validación de permisos
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [12];
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Se reciben los datos
$input = json_decode(file_get_contents("php://input"), true);
$idCategoria = $input['id_categoria'] ?? null;

if (!$idCategoria) {
    echo json_encode(["status" => "error", "message" => "Falta el parámetro id_categoria."]);
    exit;
}

try {
    // Consulta de fallas filtradas por categoría
    $sql = "SELECT id_falla, falla 
            FROM fallas 
            WHERE id_categoria = :idCategoria";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":idCategoria", $idCategoria, PDO::PARAM_INT);
    $stmt->execute();

    $fallas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($fallas && count($fallas) > 0) {
        echo json_encode([
            "status" => "ok",
            "fallas" => $fallas
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontraron fallas para la categoría seleccionada."
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}