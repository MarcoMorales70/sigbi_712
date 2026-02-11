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
$permisosRequeridos = [36]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

try {
    // Consulta única
    $sql = "SELECT 
                pp.patch,
                pp.puertos,
                pp.id_sede,
                pp.id_edificio,
                pp.id_nivel,
                pp.desc_patch,
                s.acronimo,
                e.edificio,
                n.nivel
            FROM patch_panels pp
            INNER JOIN sedes s ON pp.id_sede = s.id_sede
            INNER JOIN edificios e ON pp.id_edificio = e.id_edificio
            INNER JOIN niveles n ON pp.id_nivel = n.id_nivel
            ORDER BY pp.patch ASC";

    $stmt = $pdo->query($sql);
    $patch_p = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($patch_p)) {     // Respuesta en caso de no encontrar registros
        echo json_encode([
            "status" => "error",
            "message" => "No se encontraron patch panels registrados."
        ]);
        exit;
    }

    echo json_encode([      // Respuesta si encuentra registros 
        "status" => "ok",
        "data" => $patch_p
    ]);
} catch (Exception $e) {        // Manejo de excepciones o error de conexión
    echo json_encode([
        "status" => "error",
        "message" => "Error en servidor: " . $e->getMessage()
    ]);
}