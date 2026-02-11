<?php

// Implementación de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // Con PDO definido

// Validación de sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

// Validación de permisos
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [12];
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Leer datos del frontend
$input = json_decode(file_get_contents("php://input"), true);
$idUso = $input['id_uso'] ?? null;

if (!$idUso) {
    echo json_encode(["status" => "error", "message" => "Falta el parámetro id_uso."]);
    exit;
}

try {
    // Validar que el idUso exista en la tabla bienes
    $sqlValidar = "SELECT COUNT(*) FROM bienes WHERE id_uso = :idUso";
    $stmtValidar = $pdo->prepare($sqlValidar);
    $stmtValidar->bindParam(":idUso", $idUso, PDO::PARAM_INT);
    $stmtValidar->execute();
    $existe = $stmtValidar->fetchColumn();

    if ($existe == 0) {
        echo json_encode([
            "status" => "error",
            "message" => "El idUso proporcionado no existe en la tabla bienes."
        ]);
        exit;
    }

    // Consulta 
    $sql = "SELECT 
                b.serie_bien,
                b.id_ip,
                b.id_tipo,
                b.id_propietario,
                b.id_resg,
                i.ip,
                t.tipo_bien,
                p.propietario
            FROM bienes b
            LEFT JOIN ips i ON b.id_ip = i.id_ip
            LEFT JOIN tipo_bienes t ON b.id_tipo = t.id_tipo
            LEFT JOIN propietarios p ON b.id_propietario = p.id_propietario
            WHERE b.id_uso = :idUso";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":idUso", $idUso, PDO::PARAM_INT);
    $stmt->execute();

    $bienes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($bienes && count($bienes) > 0) {
        echo json_encode([
            "status" => "ok",
            "resultado" => $bienes
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "El usuario operador no tiene bienes asignados."
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la consulta: " . $e->getMessage()
    ]);
}