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

// Validar la serie_bien
$serie_bien = $_GET['serie_bien'] ?? null;
if (!$serie_bien || !is_string($serie_bien)) {
    echo json_encode(["status" => "error", "message" => "Serie del bien no válida."]);
    exit;
}

try {
    // Consulta detallada del bien
    $sql = "SELECT 
                b.serie_bien,
                b.marca,
                b.modelo,
                b.inventario,
                b.id_tipo,
                b.id_estado,
                b.id_propietario,
                b.id_resg,
                b.id_uso,
                u.a_paterno,
                u.a_materno,
                u.usuario,
                i.ip
            FROM bienes b
            LEFT JOIN usuarios u ON b.id_uso = u.id_usuario
            LEFT JOIN ips i ON b.id_ip = i.id_ip
            WHERE b.serie_bien = :serie_bien
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["serie_bien" => $serie_bien]);
    $bien = $stmt->fetch(PDO::FETCH_ASSOC);

    // Respuesta json
    if ($bien) {
        echo json_encode([
            "status" => "ok",
            "bien" => $bien
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Bien no encontrado."]);
    }

} catch (PDOException $e) {     // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar bien: " . $e->getMessage()
    ]);
}