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
$permisosRequeridos = [18]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consultar la serie del bien, la ip y el nombre completo del usuario que lo opera
    $sql = "SELECT 
                b.serie_bien,
                u.a_paterno,
                u.a_materno,
                u.usuario,
                i.ip
            FROM bienes b
            LEFT JOIN usuarios u ON b.id_uso = u.id_usuario
            LEFT JOIN ips i ON b.id_ip = i.id_ip
            ORDER BY b.serie_bien ASC";

    $stmt = $pdo->query($sql);
    $bienes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "bienes" => $bienes
    ]);

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar bienes: " . $e->getMessage()
    ]);
}