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
$permisosRequeridos = [38]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Obtener el parámetro patch 
$patch = $_GET['patch'] ?? null;

if (!$patch) {
    echo json_encode(["status" => "error", "message" => "Parámetro patch no proporcionado."]);
    exit;
}

try {
    // Verificar si la tabla existe en la base de datos
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $patch]);
    $existe = $stmt->fetch();

    if (!$existe) {
        echo json_encode(["status" => "error", "message" => "La tabla '$patch' no existe."]);
        exit;
    }

    // Consultar todos los registros de la tabla
    $query = "
    SELECT p.puerto_pp,
           p.id_estado,
           e.estado,
           p.puerto_sw,
           p.nodo,
           p.serie_bien,
           p.notas_puerto_pp
    FROM `$patch` AS p
    LEFT JOIN estados AS e ON p.id_estado = e.id_estado
    ORDER BY p.id_puerto ASC";

$stmt = $pdo->query($query);
$registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "ok", "data" => $registros]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}