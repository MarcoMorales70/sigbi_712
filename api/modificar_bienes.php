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
$permisosRequeridos = [19]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);

$serie_original     = $data['serie_original'] ?? null; 
$serie_nueva        = $data['serie_nueva'] ?? null;    
$inventario_actual  = $data['inventario_actual'] ?? null;
$inventario_nuevo   = $data['inventario_nuevo'] ?? null;
$marca              = $data['marca'] ?? null;
$modelo             = $data['modelo'] ?? null;
$version_soft       = $data['version_soft'] ?? null;
$id_tipo            = $data['id_tipo'] ?? null;
$id_estado          = $data['id_estado'] ?? null;
$id_propietario     = $data['id_propietario'] ?? null;
$id_resg            = $data['id_resg'] ?? null;
$id_uso             = $data['id_uso'] ?? null;
$id_ip_nuevo        = $data['id_ip'] ?? null; 

if (!$serie_original) {
    echo json_encode(["status" => "error", "message" => "Serie original no proporcionada."]);
    exit;
}

try {
    // Consultar datos actuales
    $stmt = $pdo->prepare("SELECT id_ip, serie_bien, inventario FROM bienes WHERE serie_bien = :serie LIMIT 1");
    $stmt->execute(["serie" => $serie_original]);
    $bien = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bien) {
        echo json_encode(["status" => "error", "message" => "Bien no encontrado."]);
        exit;
    }
    // Se normalizan y deciden los valores finales para mantener consistencia en las referencias
    $id_ip_actual = isset($bien['id_ip']) ? (int)$bien['id_ip'] : null;
    $id_ip_final  = ($id_ip_nuevo !== null && $id_ip_nuevo !== "") ? (int)$id_ip_nuevo : $id_ip_actual;

    $serie_final      = ($serie_nueva && $serie_nueva !== "") ? $serie_nueva : $serie_original;
    $inventario_final = ($inventario_nuevo !== null && $inventario_nuevo !== "") ? $inventario_nuevo : $inventario_actual;

    // Validar serie única
    if ($serie_final !== $serie_original) {
        $stmt = $pdo->prepare("SELECT 1 FROM bienes WHERE serie_bien = :s LIMIT 1");
        $stmt->execute(["s" => $serie_final]);
        if ($stmt->fetch()) {
            echo json_encode(["status" => "error", "code" => "SERIE_DUPLICADA", "message"=> "La nueva serie ya está registrada."]);
            exit;
        }
    }

    // Validar inventario único
    if ($inventario_final !== $inventario_actual && $inventario_final !== "") {
        $stmt = $pdo->prepare("SELECT 1 FROM bienes WHERE inventario = :inv LIMIT 1");
        $stmt->execute(["inv" => $inventario_final]);
        if ($stmt->fetch()) {
            echo json_encode(["status" => "error", "code" => "INVENTARIO_DUPLICADO", "message"=> "El número de inventario ya está registrado."]);
            exit;
        }
    }

    // Reglas adicionales para mantener coherencia en la actualizaciones y la base de datos
    // Si estado = 3 o 5 entonces liberar IP
    if (in_array((int)$id_estado, [3,5])) {
        if ($id_ip_actual !== null) {
            $stmt = $pdo->prepare("UPDATE ips SET ip = 'Disponible' WHERE id_ip = :id");
            $stmt->execute(["id" => $id_ip_actual]);
        }
        $id_ip_final = null;
    }

    // Si propietario diferente de 1 entonces inventario = null
    if ((int)$id_propietario !== 1) {
        $inventario_final = null;
    }

    // Validar nueva id_ip solo si realmente cambió y no se liberó por estado
    $ip_nueva_texto = null;
    $cambio_ip = false;

    if ($id_ip_final !== $id_ip_actual && $id_ip_final !== null) {
        $cambio_ip = true;

        $stmt = $pdo->prepare("SELECT ip FROM ips WHERE id_ip = :id LIMIT 1");
        $stmt->execute(["id" => $id_ip_final]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            echo json_encode(["status" => "error", "message" => "ID de IP no válido."]);
            exit;
        }

        if ($row['ip'] !== "Disponible") {
            echo json_encode(["status" => "error", "code" => "IP_DUPLICADA", "message"=> "La nueva IP ya está asignada."]);
            exit;
        }

        $ip_nueva_texto = "10.33.137." . $id_ip_final;
    }

    // Actualizar datos
    $pdo->beginTransaction();

    if ($cambio_ip) {
        if ($id_ip_actual !== null) {
            $stmt = $pdo->prepare("UPDATE ips SET ip = 'Disponible' WHERE id_ip = :id");
            $stmt->execute(["id" => $id_ip_actual]);
        }

        if ($id_ip_final !== null && $ip_nueva_texto !== null) {
            $stmt = $pdo->prepare("UPDATE ips SET ip = :ip WHERE id_ip = :id");
            $stmt->execute(["ip" => $ip_nueva_texto, "id" => $id_ip_final]);
        }
    }

    $stmt = $pdo->prepare("UPDATE bienes SET 
        serie_bien     = :serie_final,
        marca          = :marca,
        modelo         = :modelo,
        inventario     = :inventario_final,
        version_soft   = :version_soft,
        id_tipo        = :id_tipo,
        id_estado      = :id_estado,
        id_propietario = :id_propietario,
        id_resg        = :id_resg,
        id_uso         = :id_uso,
        id_ip          = :id_ip_final
        WHERE serie_bien = :serie_original");

    $stmt->execute([
        "serie_final"     => $serie_final,
        "marca"           => $marca,
        "modelo"          => $modelo,
        "inventario_final"=> $inventario_final,
        "version_soft"    => $version_soft,
        "id_tipo"         => $id_tipo,
        "id_estado"       => $id_estado,
        "id_propietario"  => $id_propietario,
        "id_resg"         => $id_resg,
        "id_uso"          => $id_uso,
        "id_ip_final"     => $id_ip_final,
        "serie_original"  => $serie_original
    ]);

    $pdo->commit();

    echo json_encode([
        "status" => "ok",
        "message" => "Bien modificado correctamente.",
        "serie_bien" => $serie_final,
        "inventario" => $inventario_final
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "message" => "Error al modificar bien: " . $e->getMessage()]);
}