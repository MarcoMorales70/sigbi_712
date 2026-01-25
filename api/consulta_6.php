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

// Se valida que exista un id_tecnico seleccionado
$id_tecnico = $_GET['id_tecnico'] ?? null;
if (!$id_tecnico) {
    echo json_encode(["status" => "error", "message" => "ID técnico no proporcionado."]);
    exit;
}

try {
    // Consulta enriquecida con otras tablas
$sql = "SELECT 
            u.id_usuario,
            u.usuario,
            u.a_paterno,
            u.a_materno,
            u.correo,
            c.cargo,
            d.direccion_a,
            s.acronimo,
            s.ubicacion,
            e.edificio,
            n.nivel,
            r.rol
        FROM usuarios u
        JOIN cargos c ON u.id_cargo = c.id_cargo
        JOIN direcciones_admin d ON u.id_direccion = d.id_direccion
        JOIN sedes s ON u.id_sede = s.id_sede
        JOIN edificios e ON u.id_edificio = e.id_edificio
        JOIN niveles n ON u.id_nivel = n.id_nivel
        JOIN tecnicos t ON u.id_usuario = t.id_tecnico
        JOIN roles r ON t.id_rol = r.id_rol
        WHERE u.id_usuario = :id_tecnico";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch();

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "Técnico no encontrado."]);
        exit;
    }

    // Consulta de permisos
    $sqlPermisos = "SELECT p.permiso
                    FROM permisos_tecnico pt
                    JOIN permisos p ON pt.id_permiso = p.id_permiso
                    WHERE pt.id_tecnico = :id_tecnico";

    $stmtPerm = $pdo->prepare($sqlPermisos);
    $stmtPerm->execute(["id_tecnico" => $id_tecnico]);
    $permisos = $stmtPerm->fetchAll(PDO::FETCH_COLUMN);

    // Respuesta json
    $tecnico["permisos"] = $permisos;

    echo json_encode([
        "status" => "ok",
        "tecnico" => $tecnico
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $e->getMessage()]);
}