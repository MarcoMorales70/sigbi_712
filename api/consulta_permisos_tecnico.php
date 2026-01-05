<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/conexion.php";
session_start();

header("Content-Type: application/json; charset=UTF-8");

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(7, $permisos)) { // 7 = ID del permiso "Actualizar técnico"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada"]);
    exit;
}

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;

if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "ID técnico requerido"]);
    exit;
}

try {
    // =========================
    // TRAER TODOS LOS PERMISOS
    // =========================
    $sqlPermisos = "SELECT id_permiso, permiso FROM permisos ORDER BY id_permiso ASC";
    $stmtPermisos = $pdo->query($sqlPermisos);
    $permisosDisponibles = [];
    foreach ($stmtPermisos->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $permisosDisponibles[] = [
            "id_permiso" => (int)$row["id_permiso"],
            "nombre"     => $row["permiso"] // alias para frontend
        ];
    }

    // =========================
    // TRAER PERMISOS DEL TÉCNICO
    // =========================
    $sqlSel = "SELECT id_permiso FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtSel = $pdo->prepare($sqlSel);
    $stmtSel->execute(["id_tecnico" => $id_tecnico]);
    $permisosSeleccionados = [];
    foreach ($stmtSel->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $permisosSeleccionados[] = (int)$row["id_permiso"];
    }

    // =========================
    // RESPUESTA JSON
    // =========================
    echo json_encode([
        "status" => "ok",
        "permisos" => $permisosDisponibles,
        "permisosSeleccionados" => $permisosSeleccionados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}