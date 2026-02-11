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
$permisosRequeridos = [33]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Obtener el parámetro nom_switch desde la query string
$nom_switch = $_GET['nom_switch'] ?? null;

if (!$nom_switch) {
    echo json_encode(["status" => "error", "message" => "Parámetro nom_switch no proporcionado."]);
    exit;
}

try {
    // Verificar si la tabla existe en la base de datos
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $nom_switch]);
    $existe = $stmt->fetch();

    if (!$existe) {
        echo json_encode(["status" => "error", "message" => "La tabla '$nom_switch' no existe."]);
        exit;
    }

    // Consultar todos los registros de la tabla
    $query = "
    SELECT p.puerto_sw,
           p.id_estado,
           e.estado,
           p.voz,
           p.datos,
           p.puerto_pp,
           p.notas_puerto_sw
    FROM `$nom_switch` AS p
    LEFT JOIN estados AS e ON p.id_estado = e.id_estado
    ORDER BY p.id_puerto ASC";

$stmt = $pdo->query($query);
$registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "ok", "data" => $registros]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}