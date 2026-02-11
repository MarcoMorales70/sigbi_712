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

// Leer datos del frontend
$input = json_decode(file_get_contents("php://input"), true);

$id_usuario   = $input['id_usuario']   ?? null;
$id_uso       = $input['id_uso']       ?? null;
$serie_bien   = $input['serie_bien']   ?? null;
$id_categoria = $input['id_categoria'] ?? null;
$id_tecnico   = $input['id_tecnico']   ?? null;
$id_falla     = $input['id_falla']     ?? null;
$notas        = $input['notas']        ?? null;

$id_estado = 8;

// Validar datos mínimos
if ($id_usuario === null || $serie_bien === null || $id_categoria === null || $id_tecnico === null || $id_falla === null) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

try {
    // Insertar solicitud con los campos enviados más la fecha de creación
    $sql = "INSERT INTO solicitudes (
                fecha_crea,
                id_categoria,
                id_tecnico,
                id_estado,
                id_falla,
                serie_bien,
                id_usuario,
                id_uso,
                notas_solucion
            ) VALUES (
                NOW(),
                :id_categoria,
                :id_tecnico,
                :id_estado,
                :id_falla,
                :serie_bien,
                :id_usuario,
                :id_uso,
                :notas
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":id_categoria", $id_categoria, PDO::PARAM_INT);
    $stmt->bindParam(":id_tecnico", $id_tecnico, PDO::PARAM_INT);
    $stmt->bindParam(":id_estado", $id_estado, PDO::PARAM_INT);
    $stmt->bindParam(":id_falla", $id_falla, PDO::PARAM_INT);
    $stmt->bindParam(":serie_bien", $serie_bien, PDO::PARAM_STR);
    $stmt->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
    $stmt->bindParam(":id_uso", $id_uso, PDO::PARAM_INT);
    $stmt->bindParam(":notas", $notas, PDO::PARAM_STR);

    $stmt->execute();

    $folio = $pdo->lastInsertId();

    echo json_encode([
        "status" => "ok",
        "message" => "Solicitud registrada con éxito",
        "folio" => $folio
    ]);
    exit;

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Falló registro de solicitud: " . $e->getMessage()
    ]);
    exit;
}