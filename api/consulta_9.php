<?php
require_once __DIR__ . "/cors.php";
session_start();
include __DIR__ . "/conexion.php"; 

header("Content-Type: application/json; charset=UTF-8");

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(9, $permisos)) { // 9 = ID del permiso "Eliminar técnicos"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar un ID técnico."]);
    exit;
}

try {
    // =========================
    // BUSCAR TÉCNICO
    // =========================
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

    // =========================
    // RESPUESTA JSON
    // =========================
    echo json_encode([
        "status" => "ok",
        "tecnico" => $tecnico,
        "message" => "Técnico encontrado. Confirme si desea eliminar."
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}