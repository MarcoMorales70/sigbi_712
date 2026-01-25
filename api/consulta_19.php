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
$permisosRequeridos = [19]; 
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
    // Consulta detallada del bien
    $sql = "SELECT 
                b.serie_bien,
                b.marca,
                b.modelo,
                b.inventario,
                b.version_soft,
                b.id_tipo,
                b.id_estado,
                b.id_propietario,
                b.id_resg,
                b.id_uso,
                b.id_ip,
                u.a_paterno,
                u.a_materno,
                u.usuario,
                i.ip,
                i.id_ip,
                e.estado AS estado_actual 
            FROM bienes b
            LEFT JOIN usuarios u ON b.id_uso = u.id_usuario
            LEFT JOIN ips i ON b.id_ip = i.id_ip
            LEFT JOIN estados e ON b.id_estado = e.id_estado
            WHERE b.serie_bien = :serie
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["serie" => $serie_bien]);
    $bien = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bien) {
        echo json_encode(["status" => "error", "message" => "Bien no encontrado."]);
        exit;
    }

    // Listas para los selects
    $stmt = $pdo->query("SELECT id_tipo, tipo_bien FROM tipo_bienes ORDER BY tipo_bien ASC");
    $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT id_estado, estado, id_entidad FROM estados ORDER BY estado ASC");
    $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT id_propietario, propietario FROM propietarios ORDER BY propietario ASC");
    $propietarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT id_usuario, a_paterno, a_materno, usuario FROM usuarios ORDER BY a_paterno ASC");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta json
    echo json_encode([
        "status" => "ok",
        "bien" => $bien,
        "tipos" => $tipos,
        "estados" => $estados,
        "propietarios" => $propietarios,
        "usuarios" => $usuarios
    ]);

} catch (PDOException $e) {     // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error al consultar bien: " . $e->getMessage()
    ]);
}