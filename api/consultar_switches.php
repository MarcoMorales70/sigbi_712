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
$permisosRequeridos = [31]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consulta única
    $sql = "SELECT 
                sw.nom_switch,
                sw.serie_sw,
                sw.mac_sw,
                sw.puertos,
                sw.id_sede,
                sw.id_edificio,
                sw.id_nivel,
                sw.desc_switch,
                s.acronimo,
                e.edificio,
                n.nivel
            FROM switches sw
            INNER JOIN sedes s ON sw.id_sede = s.id_sede
            INNER JOIN edificios e ON sw.id_edificio = e.id_edificio
            INNER JOIN niveles n ON sw.id_nivel = n.id_nivel
            ORDER BY sw.nom_switch ASC";

    $stmt = $pdo->query($sql);
    $switches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($switches)) {     // Respuesta en caso de no encontrar registros
        echo json_encode([
            "status" => "error",
            "message" => "No se encontraron switches registrados."
        ]);
        exit;
    }

    echo json_encode([      // Respuesta si encuantra registros 
        "status" => "ok",
        "data" => $switches
    ]);
} catch (Exception $e) {        // Manejo de excepciones o error de conexión
    echo json_encode([
        "status" => "error",
        "message" => "Error en servidor: " . $e->getMessage()
    ]);
}