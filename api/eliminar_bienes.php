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
$permisosRequeridos = [20]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);
$serie_bien = $data['serie_bien'] ?? null;

if (!$serie_bien) {
    echo json_encode(["status" => "error", "message" => "Serie del bien no proporcionada."]);
    exit;
}

try {
    // Obtener el id_ip del bien
    $stmt = $pdo->prepare("SELECT id_ip FROM bienes WHERE serie_bien = :serie LIMIT 1");
    $stmt->execute(["serie" => $serie_bien]);
    $bien = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bien) {
        echo json_encode(["status" => "error", "message" => "Bien no encontrado."]);
        exit;
    }

    $id_ip = $bien['id_ip'] ?? null;

    // Operaciones de eliminar bien y actualizar ip
    $pdo->beginTransaction();

    // Eliminar bien
    $stmt = $pdo->prepare("DELETE FROM bienes WHERE serie_bien = :serie");
    $stmt->execute(["serie" => $serie_bien]);

    // Liberar IP si existe
    if ($id_ip) {
        $stmt = $pdo->prepare("UPDATE ips SET ip = 'Disponible' WHERE id_ip = :id");
        $stmt->execute(["id" => $id_ip]);
    }

    $pdo->commit();

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "message" => "Bien eliminado correctamente.",
        "serie_bien" => $serie_bien
    ]);

} catch (PDOException $e) {     // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar bien: " . $e->getMessage()
    ]);
}