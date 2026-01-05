<?php
require_once __DIR__ . "/cors.php";
session_start();
include __DIR__ . "/conexion.php"; // aquí ya tienes $pdo definido

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(5, $permisos)) { // 5 = ID del permiso "Registrar técnicos"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // =========================
    // CONSULTAR ROLES
    // =========================
    $sqlRoles = "SELECT id_rol, rol FROM roles ORDER BY rol ASC";
    $stmtRoles = $pdo->query($sqlRoles);
    $roles = $stmtRoles->fetchAll(PDO::FETCH_ASSOC);

    // =========================
    // CONSULTAR ESTADOS (solo id_entidad=2)
    // =========================
    $sqlEstados = "SELECT id_estado, estado FROM estados WHERE id_entidad = 2 ORDER BY estado ASC";
    $stmtEstados = $pdo->query($sqlEstados);
    $estados = $stmtEstados->fetchAll(PDO::FETCH_ASSOC);

    // =========================
    // RESPUESTA JSON
    // =========================
    echo json_encode([
        "status" => "ok",
        "roles" => $roles,
        "estados" => $estados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}