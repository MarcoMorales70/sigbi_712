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
if (!in_array(6, $permisos)) { // 6 = ID del permiso "Consultar técnicos"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // =========================
    // CONSULTAR TÉCNICOS
    // =========================
    // Relación: tecnicos.id_tecnico = usuarios.id_usuario
    // JOIN con roles para obtener el nombre del rol
    $sql = "SELECT 
                t.id_tecnico,
                r.rol,
                CONCAT(u.usuario, ' ', u.a_paterno, ' ', u.a_materno) AS nombre_completo
            FROM tecnicos t
            INNER JOIN roles r ON t.id_rol = r.id_rol
            INNER JOIN usuarios u ON t.id_tecnico = u.id_usuario
            ORDER BY t.id_tecnico ASC";

    $stmt = $pdo->query($sql);
    $tecnicos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =========================
    // RESPUESTA JSON
    // =========================
    echo json_encode([
        "status" => "ok",
        "tecnicos" => $tecnicos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}