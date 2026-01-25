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
$permisosRequeridos = [21]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$dataRaw = file_get_contents("php://input");
$data = json_decode($dataRaw, true);

$baja = trim($data["baja"] ?? "");
$dictamenes = $data["dictamenes"] ?? [];

if ($baja === "" || empty($dictamenes)) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

// Consulta para validar id_dictamen duplicado
try {

    foreach ($dictamenes as $d) {
        $stmt = $pdo->prepare("SELECT id_dictamen FROM dictamenes WHERE id_dictamen = ?");
        $stmt->execute([$d["id_dictamen"]]);
        if ($stmt->fetch()) {
            echo json_encode([
                "status" => "error",
                "message" => "El dictamen con ID {$d["id_dictamen"]} ya está registrado. Ingrese uno válido."
            ]);
            exit;
        }
    }

    // Consulta para evaluar que la cantidad de bienes de los dictamenes no sea mayor al total de bienes global de la baja
    $sumatoria = array_sum(array_column($dictamenes, "cant_bienes"));

    $stmt = $pdo->prepare("SELECT id_baja, total_bienes FROM bajas WHERE baja = ?");
    $stmt->execute([$baja]);
    $row = $stmt->fetch();

    if (!$row) {
        echo json_encode(["status" => "error", "message" => "La baja no existe."]);
        exit;
    }

    $id_baja = $row["id_baja"];
    $total_bienes = $row["total_bienes"];

    if ($sumatoria < $total_bienes) {
        echo json_encode(["status" => "error", "message" => "La sumatoria de bienes está por debajo del total de la baja."]);
        exit;
    }
    if ($sumatoria > $total_bienes) {
        echo json_encode(["status" => "error", "message" => "La sumatoria de bienes está por encima del total de la baja."]);
        exit;
    }

    // Registro en dictamenes
    $stmt = $pdo->prepare("INSERT INTO dictamenes (id_dictamen, id_baja, cant_bienes) VALUES (?, ?, ?)");
    foreach ($dictamenes as $d) {
        $stmt->execute([$d["id_dictamen"], $id_baja, $d["cant_bienes"]]);
    }

    echo json_encode(["status" => "ok", "message" => "Dictámenes registrados correctamente."]);

} catch (Exception $e) {    // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}