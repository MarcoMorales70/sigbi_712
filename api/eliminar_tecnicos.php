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
    // INICIAR TRANSACCIÓN
    // =========================
    $pdo->beginTransaction();

    // 1. Eliminar permisos asociados
    $sqlPerm = "DELETE FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtPerm = $pdo->prepare($sqlPerm);
    $stmtPerm->execute(["id_tecnico" => $id_tecnico]);

    // 2. Eliminar técnico
    $sqlTec = "DELETE FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmtTec = $pdo->prepare($sqlTec);
    $stmtTec->execute(["id_tecnico" => $id_tecnico]);

    // Confirmar transacción
    $pdo->commit();

    echo json_encode([
        "status" => "ok",
        "message" => "Técnico y permisos eliminados correctamente."
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar técnico: " . $e->getMessage()
    ]);
}