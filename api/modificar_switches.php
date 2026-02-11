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
$permisosRequeridos = [32]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Se reciben los datos
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Datos no recibidos."]);
    exit;
}

// Se asocian los valorea a variables 
$nom_switch_anterior = $input["nom_switch_anterior"] ?? null;
$nom_switch          = $input["nom_switch"] ?? null;
$serie_sw            = $input["serie_sw"] ?? null;
$mac_sw              = $input["mac_sw"] ?? null;
$puertos             = $input["puertos"] ?? null;
$id_sede             = $input["id_sede"] ?? null;
$id_edificio         = $input["id_edificio"] ?? null;
$id_nivel            = $input["id_nivel"] ?? null;
$desc_switch         = $input["desc_switch"] ?? null;

if (!$nom_switch_anterior) {
    echo json_encode(["status" => "error", "message" => "Falta el identificador del switch a modificar."]);
    exit;
}

try {
    // Validar que exista la tabla de puertos (switch)
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $nom_switch_anterior]);
    $existeTabla = $stmt->fetch();

    if (!$existeTabla) {
        echo json_encode(["status" => "error", "message" => "La tabla de puertos '$nom_switch_anterior' no existe."]);
        exit;
    }

    // Validar que exista el switch en la tabla switches
    $stmt = $pdo->prepare("SELECT * FROM switches WHERE nom_switch = :nom_switch_anterior");
    $stmt->execute([":nom_switch_anterior" => $nom_switch_anterior]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$registro) {
        echo json_encode(["status" => "error", "message" => "El switch '$nom_switch_anterior' no existe en la tabla switches."]);
        exit;
    }

    // Si las dos validaciones son correctas, actualizar el registro en switches
    $update = $pdo->prepare("
        UPDATE switches
        SET nom_switch = :nom_switch,
            serie_sw = :serie_sw,
            mac_sw = :mac_sw,
            puertos = :puertos,
            id_sede = :id_sede,
            id_edificio = :id_edificio,
            id_nivel = :id_nivel,
            desc_switch = :desc_switch
        WHERE nom_switch = :nom_switch_anterior
    ");

    $ok = $update->execute([
        ":nom_switch" => $nom_switch,
        ":serie_sw" => $serie_sw,
        ":mac_sw" => $mac_sw,
        ":puertos" => $puertos,
        ":id_sede" => $id_sede,
        ":id_edificio" => $id_edificio,
        ":id_nivel" => $id_nivel,
        ":desc_switch" => $desc_switch,
        ":nom_switch_anterior" => $nom_switch_anterior
    ]);

    if (!$ok) {
        echo json_encode(["status" => "error", "message" => "Error al modificar el switch en la tabla switches."]);
        exit;
    }

    // Si el nombre cambió, renombrar la tabla y actualizar los puertos
    if ($nom_switch_anterior !== $nom_switch) {
        $pdo->exec("RENAME TABLE `$nom_switch_anterior` TO `$nom_switch`");   // Renombrar la tabla y actualizar el nombre de los puertos
        $updatePuertos = $pdo->prepare("   
            UPDATE `$nom_switch`
            SET puerto_sw = CONCAT(:nom_switch, SUBSTRING(puerto_sw, 10))
        ");
        $updatePuertos->execute([":nom_switch" => $nom_switch]);
    }

    echo json_encode(["status" => "ok", "message" => "Switch y tabla de puertos modificados correctamente."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}