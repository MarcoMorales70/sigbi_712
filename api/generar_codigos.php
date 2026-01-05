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
if (!in_array(10, $permisos)) { // 10 = ID del permiso "Generar códigos"
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
    // VALIDAR EXISTENCIA DEL TÉCNICO
    // =========================
    $sqlCheck = "SELECT id_tecnico FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmtCheck = $pdo->prepare($sqlCheck);
    $stmtCheck->execute(["id_tecnico" => $id_tecnico]);
    $existe = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$existe) {
        echo json_encode(["status" => "error", "message" => "El técnico no existe."]);
        exit;
    }

    // =========================
    // GENERAR CÓDIGO ALEATORIO
    // =========================
    $codigo = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)); // 6 caracteres alfanuméricos

    // =========================
    // GUARDAR EN BD
    // =========================
    $sqlUpdate = "UPDATE tecnicos 
                  SET codigo_temp = :codigo
                  WHERE id_tecnico = :id_tecnico";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([
        "codigo" => $codigo,
        "id_tecnico" => $id_tecnico
    ]);

    echo json_encode([
        "status" => "ok",
        "codigo" => $codigo,
        "message" => "Código generado y almacenado correctamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la operación: " . $e->getMessage()
    ]);
}