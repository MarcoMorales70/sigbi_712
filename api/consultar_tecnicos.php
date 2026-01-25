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
$permisosRequeridos = [6]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consultar técnicos, relación: tecnicos.id_tecnico = usuarios.id_usuario y join con roles para obtener el nombre del rol
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

    // Respuesta json
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