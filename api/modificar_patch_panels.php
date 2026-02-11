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
$permisosRequeridos = [37]; 
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

// Se asocian los valores a variables 
$patch_anterior      = $input["patch_anterior"] ?? null;
$patch               = $input["patch"] ?? null;
$puertos             = $input["puertos"] ?? null;
$id_sede             = $input["id_sede"] ?? null;
$id_edificio         = $input["id_edificio"] ?? null;
$id_nivel            = $input["id_nivel"] ?? null;
$desc_patch          = $input["desc_patch"] ?? null;

if (!$patch_anterior) {
    echo json_encode(["status" => "error", "message" => "Falta el identificador del patch panel a modificar."]);
    exit;
}

try {
    // Validar que exista la tabla de puertos (patch)
    $stmt = $pdo->prepare("SHOW TABLES LIKE :tabla");
    $stmt->execute([":tabla" => $patch_anterior]);
    $existeTabla = $stmt->fetch();

    if (!$existeTabla) {
        echo json_encode(["status" => "error", "message" => "La tabla de puertos '$patch_anterior' no existe."]);
        exit;
    }

    // Validar que exista el patch en la tabla patch_panels
    $stmt = $pdo->prepare("SELECT * FROM patch_panels WHERE patch = :patch_anterior");
    $stmt->execute([":patch_anterior" => $patch_anterior]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$registro) {
        echo json_encode(["status" => "error", "message" => "El patch panel '$patch_anterior' no existe en la tabla patch_panels."]);
        exit;
    }

    // Si las dos validaciones son correctas, actualizar el registro en patch_panels 
    $update = $pdo->prepare("
        UPDATE patch_panels
        SET patch = :patch,
            puertos = :puertos,
            id_sede = :id_sede,
            id_edificio = :id_edificio,
            id_nivel = :id_nivel,
            desc_patch = :desc_patch
        WHERE patch = :patch_anterior
    ");

    $ok = $update->execute([
        ":patch" => $patch,
        ":puertos" => $puertos,
        ":id_sede" => $id_sede,
        ":id_edificio" => $id_edificio,
        ":id_nivel" => $id_nivel,
        ":desc_patch" => $desc_patch,
        ":patch_anterior" => $patch_anterior
    ]);

    if (!$ok) {
        echo json_encode(["status" => "error", "message" => "Error al modificar el patch panel en la tabla patch_panels."]);
        exit;
    }

    // Si el nombre cambió, renombrar la tabla y actualizar los puertos
    if ($patch_anterior !== $patch) {
        $pdo->exec("RENAME TABLE `$patch_anterior` TO `$patch`");   // Renombrar la tabla y actualizar el nombre de los puertos
        $updatePuertos = $pdo->prepare("   
            UPDATE `$patch`
            SET puerto_pp = CONCAT(:patch, SUBSTRING(puerto_pp, 10))
        ");
        $updatePuertos->execute([":patch" => $patch]);
    }

    echo json_encode(["status" => "ok", "message" => "Patch Panel y tabla de puertos modificados correctamente."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}