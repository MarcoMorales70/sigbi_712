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
    // BUSCAR TÉCNICO
    // =========================
    $sqlTec = "SELECT id_tecnico, id_rol, id_categoria, id_estado 
               FROM tecnicos 
               WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sqlTec);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "Técnico no encontrado"]);
        exit;
    }

    // =========================
    // TRAER ROLES
    // =========================
    $sqlRoles = "SELECT id_rol, rol FROM roles";
    $stmtRoles = $pdo->query($sqlRoles);
    $roles = [];
    foreach ($stmtRoles->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $roles[] = [
            "id_rol" => (int)$row["id_rol"],
            "nombre" => $row["rol"] // alias para frontend
        ];
    }

    // =========================
    // TRAER ESTADOS (solo id_entidad=2)
    // =========================
    $sqlEstados = "SELECT id_estado, estado FROM estados WHERE id_entidad = 2";
    $stmtEstados = $pdo->query($sqlEstados);
    $estados = [];
    foreach ($stmtEstados->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $estados[] = [
            "id_estado" => (int)$row["id_estado"],
            "nombre" => $row["estado"] // alias para frontend
        ];
    }

    // =========================
    // RESPUESTA JSON
    // =========================
    echo json_encode([
        "status" => "ok",
        "tecnico" => $tecnico,
        "roles" => $roles,
        "estados" => $estados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}