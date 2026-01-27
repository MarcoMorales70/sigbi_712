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
$permisosRequeridos = [27]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir y asignar datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$consulta = $data["consulta_elegida"] ?? 0;
$id_usuario = $data["id_usuario"] ?? "";
$id_cargo = $data["id_cargo"] ?? "";
$id_direccion = $data["id_direccion"] ?? "";
$id_sede = $data["id_sede"] ?? "";
$id_edificio = $data["id_edificio"] ?? "";
$id_nivel = $data["id_nivel"] ?? "";

try {
    $sql = "";
    $params = [];

    // Consulta según la opción elegida en el frontend
    if ($consulta == 1) {
        // Buscar por id_usuario
        $sql = "SELECT u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                       c.cargo, d.direccion_a, s.acronimo, e.edificio, n.nivel
                FROM usuarios u
                LEFT JOIN cargos c ON u.id_cargo = c.id_cargo
                LEFT JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
                LEFT JOIN sedes s ON u.id_sede = s.id_sede
                LEFT JOIN edificios e ON u.id_edificio = e.id_edificio
                LEFT JOIN niveles n ON u.id_nivel = n.id_nivel
                WHERE u.id_usuario = ?";
        $params = [$id_usuario];
    } elseif ($consulta == 2) {
        // Buscar por id_cargo
        $sql = "SELECT u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                       c.cargo, d.direccion_a, s.acronimo, e.edificio, n.nivel
                FROM usuarios u
                LEFT JOIN cargos c ON u.id_cargo = c.id_cargo
                LEFT JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
                LEFT JOIN sedes s ON u.id_sede = s.id_sede
                LEFT JOIN edificios e ON u.id_edificio = e.id_edificio
                LEFT JOIN niveles n ON u.id_nivel = n.id_nivel
                WHERE u.id_cargo = ?";
        $params = [$id_cargo];
    } elseif ($consulta == 3) {
        // Buscar por id_direccion
        $sql = "SELECT u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                       c.cargo, d.direccion_a, s.acronimo, e.edificio, n.nivel
                FROM usuarios u
                LEFT JOIN cargos c ON u.id_cargo = c.id_cargo
                LEFT JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
                LEFT JOIN sedes s ON u.id_sede = s.id_sede
                LEFT JOIN edificios e ON u.id_edificio = e.id_edificio
                LEFT JOIN niveles n ON u.id_nivel = n.id_nivel
                WHERE u.id_direccion = ?";
        $params = [$id_direccion];
    } elseif ($consulta == 4) {
        // Buscar por sede + edificio + nivel 
        $sql = "SELECT u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                       c.cargo, d.direccion_a, s.acronimo, e.edificio, n.nivel
                FROM usuarios u
                LEFT JOIN cargos c ON u.id_cargo = c.id_cargo
                LEFT JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
                LEFT JOIN sedes s ON u.id_sede = s.id_sede
                LEFT JOIN edificios e ON u.id_edificio = e.id_edificio
                LEFT JOIN niveles n ON u.id_nivel = n.id_nivel
                WHERE u.id_sede = ? AND u.id_edificio = ? AND u.id_nivel = ?";
        $params = [$id_sede, $id_edificio, $id_nivel];
    } elseif ($consulta == 5) {
        // Todos los usuarios
        $sql = "SELECT u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                       c.cargo, d.direccion_a, s.acronimo, e.edificio, n.nivel
                FROM usuarios u
                LEFT JOIN cargos c ON u.id_cargo = c.id_cargo
                LEFT JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
                LEFT JOIN sedes s ON u.id_sede = s.id_sede
                LEFT JOIN edificios e ON u.id_edificio = e.id_edificio
                LEFT JOIN niveles n ON u.id_nivel = n.id_nivel";
        $params = [];
    } else {
        echo json_encode(["status" => "error", "message" => "Consulta inválida."]);
        exit;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Respuesta json
    echo json_encode(["status" => "ok", "resultados" => $resultados]);
} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en servidor: " . $e->getMessage()]);
}