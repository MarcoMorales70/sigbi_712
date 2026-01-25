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
$permisosRequeridos = [10]; 
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
    // Se valida la existencia del técnico
    $sqlCheck = "SELECT id_tecnico FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmtCheck = $pdo->prepare($sqlCheck);
    $stmtCheck->execute(["id_tecnico" => $id_tecnico]);
    $existe = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$existe) {
        echo json_encode(["status" => "error", "message" => "El técnico no existe."]);
        exit;
    }

    // Se genera un código aleatorio y se almacena
    $codigo = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)); // 6 caracteres alfanuméricos

    // Se almacena según el técnico corresponda
    $sqlUpdate = "UPDATE tecnicos 
                  SET codigo_temp = :codigo
                  WHERE id_tecnico = :id_tecnico";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([
        "codigo" => $codigo,
        "id_tecnico" => $id_tecnico
    ]);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "codigo" => $codigo,
        "message" => "Código generado y almacenado correctamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error en la operación: " . $e->getMessage()
    ]);
}