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
$permisosRequeridos = [5, 7, 17, 19]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);

$serie_bien     = $data['serie_bien'] ?? null;
$id_ip          = $data['id_ip'] ?? null;
$id_tipo        = $data['id_tipo'] ?? null;
$marca          = $data['marca'] ?? null;
$modelo         = $data['modelo'] ?? null;
$version_soft   = $data['version_soft'] ?? null;
$inventario     = $data['inventario'] ?? null;
$id_estado      = $data['id_estado'] ?? null;
$id_propietario = $data['id_propietario'] ?? null;
$id_resg        = $data['id_resg'] ?? null;
$id_uso         = $data['id_uso'] ?? null;

// Validaciones básicas
if (!$serie_bien) {
    echo json_encode(["status" => "error", "message" => "Serie del bien no proporcionada."]);
    exit;
}

if (!$id_tipo) {
    echo json_encode(["status" => "error", "message" => "Tipo de bien no proporcionado."]);
    exit;
}

if (!$marca || strlen($marca) > 50) {
    echo json_encode(["status" => "error", "message" => "Marca no válida."]);
    exit;
}

if (!$modelo || strlen($modelo) > 50) {
    echo json_encode(["status" => "error", "message" => "Modelo no válido."]);
    exit;
}

if (!$version_soft || strlen($version_soft) > 50) {
    echo json_encode(["status" => "error", "message" => "Versión no válida."]);
    exit;
}

// Validar inventario solo si el propietario es SICT id_propietario = 1
if ($id_propietario == 1) {
    if (!$inventario || strlen($inventario) !== 35) {
        echo json_encode(["status" => "error", "message" => "El inventario debe contener exactamente 35 caracteres."]);
        exit;
    }
    if (!preg_match('/^[0-9I ]{35}$/', $inventario)) {
        echo json_encode(["status" => "error", "message" => "El inventario solo puede contener números, espacios y la letra I mayúscula."]);
        exit;
    }
}

// Validar id de usuario resguardante
if ($id_resg && !preg_match('/^[0-9]{7}$/', $id_resg)) {
    echo json_encode(["status" => "error", "message" => "ID de resguardante inválido."]);
    exit;
}
// Validar id de usuario operador
if ($id_uso && !preg_match('/^[0-9]{7}$/', $id_uso)) {
    echo json_encode(["status" => "error", "message" => "ID de usuario operador inválido."]);
    exit;
}

// Validación de la id disponible
$ipCompleta = null;
if ($id_ip) {
    $stmt = $pdo->prepare("SELECT ip FROM ips WHERE id_ip = :id LIMIT 1");
    $stmt->execute(["id" => $id_ip]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["status" => "error", "message" => "ID de IP no válido."]);
        exit;
    }

    if ($row['ip'] !== "Disponible") {
        echo json_encode([
            "status" => "error",
            "code"   => "IP_DUPLICADA",
            "message"=> "La IP ya está asignada."
        ]);
        exit;
    }

    $ipCompleta = "10.33.137." . $id_ip;
}

// Validar que la serie es única
$stmt = $pdo->prepare("SELECT 1 FROM bienes WHERE serie_bien = :s LIMIT 1");
$stmt->execute(["s" => $serie_bien]);
if ($stmt->fetch()) {
    echo json_encode([
        "status" => "error",
        "code"   => "SERIE_DUPLICADA",
        "message"=> "La serie ya está registrada."
    ]);
    exit;
}

// Válidar que el inventario es único pero solo si aplica 
if ($inventario) {
    $stmt = $pdo->prepare("SELECT 1 FROM bienes WHERE inventario = :inv LIMIT 1");
    $stmt->execute(["inv" => $inventario]);
    if ($stmt->fetch()) {
        echo json_encode([
            "status" => "error",
            "code"   => "INVENTARIO_DUPLICADO",
            "message"=> "El número de inventario ya está registrado."
        ]);
        exit;
    }
}

try {
    $pdo->beginTransaction(); // Se inicia la serie de operaciones

    $stmt = $pdo->prepare("INSERT INTO bienes 
        (serie_bien, id_ip, id_tipo, marca, modelo, version_soft, inventario, id_estado, id_propietario, id_resg, id_uso, fecha_asig)  
        VALUES (:serie_bien, :id_ip, :id_tipo, :marca, :modelo, :version_soft, :inventario, :id_estado, :id_propietario, :id_resg, :id_uso, NOW())");

    $stmt->execute([
        "serie_bien"    => $serie_bien,
        "id_ip"         => $id_ip ?: null,
        "id_tipo"       => $id_tipo,
        "marca"         => $marca,
        "modelo"        => $modelo,
        "version_soft"  => $version_soft,
        "inventario"    => $inventario ?: null,
        "id_estado"     => $id_estado ?: null,
        "id_propietario"=> $id_propietario ?: null,
        "id_resg"       => $id_resg ?: null,
        "id_uso"        => $id_uso ?: null
    ]);

    if ($id_ip && $ipCompleta) {
        $stmt = $pdo->prepare("UPDATE ips SET ip = :ip WHERE id_ip = :id");
        $stmt->execute([
            "ip" => $ipCompleta,
            "id" => $id_ip
        ]);
    }

    $pdo->commit();
    // Respuestas json
    echo json_encode(["status" => "ok", "message" => "Bien registrado correctamente."]);

} catch (PDOException $e) {  // Manejo de excepciones
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error en la operación: " . $e->getMessage()]);
}