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

// Validación de permisos
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [13]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Recibir el dato del frontend
$input = json_decode(file_get_contents("php://input"), true);
$folio = $input["folio"] ?? null;

if (!$folio) {
    echo json_encode(["status" => "error", "message" => "Folio no proporcionado."]);
    exit;
}

try {
    // Consultar solicitud
    $stmt = $pdo->prepare("SELECT fecha_crea, fecha_cierre, fecha_term, id_categoria, id_tecnico, id_estado, id_falla, serie_bien, id_usuario, id_uso, notas_solucion, id_evidencia 
                           FROM solicitudes WHERE folio = :folio LIMIT 1");
    $stmt->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stmt->execute();
    $solicitud = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$solicitud) {
        echo json_encode(["status" => "error", "message" => "Folio no encontrado."]);
        exit;
    }

    // Variables principales
    $fecha_crea     = $solicitud["fecha_crea"];
    $fecha_cierre   = $solicitud["fecha_cierre"];
    $fecha_term     = $solicitud["fecha_term"];
    $id_categoria   = $solicitud["id_categoria"];
    $id_tecnico     = $solicitud["id_tecnico"];
    $id_estado      = $solicitud["id_estado"];
    $id_falla       = $solicitud["id_falla"];
    $serie_bien     = $solicitud["serie_bien"];
    $id_usuario     = $solicitud["id_usuario"];
    $id_uso         = $solicitud["id_uso"];
    $notas_solucion = $solicitud["notas_solucion"];
    $id_evidencia   = $solicitud["id_evidencia"];

    // Consultar categoria
    $stmt = $pdo->prepare("SELECT categoria FROM categorias WHERE id_categoria = :id_categoria");
    $stmt->bindParam(":id_categoria", $id_categoria, PDO::PARAM_INT);
    $stmt->execute();
    $categoria = $stmt->fetchColumn();

    // Consultar estado
    $stmt = $pdo->prepare("SELECT estado FROM estados WHERE id_estado = :id_estado");
    $stmt->bindParam(":id_estado", $id_estado, PDO::PARAM_INT);
    $stmt->execute();
    $estado = $stmt->fetchColumn();

    // Consultar falla
    $stmt = $pdo->prepare("SELECT falla FROM fallas WHERE id_falla = :id_falla");
    $stmt->bindParam(":id_falla", $id_falla, PDO::PARAM_INT);
    $stmt->execute();
    $falla = $stmt->fetchColumn();

    // Consultar bienes
    $stmt = $pdo->prepare("SELECT id_ip, id_propietario, id_resg FROM bienes WHERE serie_bien = :serie_bien");
    $stmt->bindParam(":serie_bien", $serie_bien, PDO::PARAM_STR);
    $stmt->execute();
    $bien = $stmt->fetch(PDO::FETCH_ASSOC);

    $id_ip        = $bien["id_ip"] ?? null;
    $id_propietario = $bien["id_propietario"] ?? null;
    $id_resg      = $bien["id_resg"] ?? null;

    // Consultar ip
    $stmt = $pdo->prepare("SELECT ip FROM ips WHERE id_ip = :id_ip");
    $stmt->bindParam(":id_ip", $id_ip, PDO::PARAM_INT);
    $stmt->execute();
    $ip = $stmt->fetchColumn();

    // Consultar propietario
    $stmt = $pdo->prepare("SELECT propietario FROM propietarios WHERE id_propietario = :id_propietario");
    $stmt->bindParam(":id_propietario", $id_propietario, PDO::PARAM_INT);
    $stmt->execute();
    $propietario = $stmt->fetchColumn();

    // Consultar usuario resguardante
    $stmt = $pdo->prepare("SELECT usuario, a_paterno, a_materno FROM usuarios WHERE id_usuario = :id_resg");
    $stmt->bindParam(":id_resg", $id_resg, PDO::PARAM_INT);
    $stmt->execute();
    $usuarioResg = $stmt->fetch(PDO::FETCH_ASSOC);

    $usuario_resg   = $usuarioResg["usuario"] ?? null;
    $a_paterno_resg = $usuarioResg["a_paterno"] ?? null;
    $a_materno_resg = $usuarioResg["a_materno"] ?? null;

    // Consultar usuario operador
    $stmt = $pdo->prepare("SELECT usuario, a_paterno, a_materno FROM usuarios WHERE id_usuario = :id_uso");
    $stmt->bindParam(":id_uso", $id_uso, PDO::PARAM_INT);
    $stmt->execute();
    $usuarioUso = $stmt->fetch(PDO::FETCH_ASSOC);

    $usuario_uso   = $usuarioUso["usuario"] ?? null;
    $a_paterno_uso = $usuarioUso["a_paterno"] ?? null;
    $a_materno_uso = $usuarioUso["a_materno"] ?? null;

    // Consultar usuario que reporta
    $stmt = $pdo->prepare("SELECT usuario, a_paterno, a_materno FROM usuarios WHERE id_usuario = :id_usuario");
    $stmt->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $usuarioRepor = $stmt->fetch(PDO::FETCH_ASSOC);

    $usuario_repor   = $usuarioRepor["usuario"] ?? null;
    $a_paterno_repor = $usuarioRepor["a_paterno"] ?? null;
    $a_materno_repor = $usuarioRepor["a_materno"] ?? null;

    // Consultar técnico
    $stmt = $pdo->prepare("SELECT usuario, a_paterno, a_materno FROM usuarios WHERE id_usuario = :id_tecnico");
    $stmt->bindParam(":id_tecnico", $id_tecnico, PDO::PARAM_INT);
    $stmt->execute();
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    $usuario_tec   = $tecnico["usuario"] ?? null;
    $a_paterno_tec = $tecnico["a_paterno"] ?? null;
    $a_materno_tec = $tecnico["a_materno"] ?? null;

    // Respuesta final
    echo json_encode([
        "status" => "ok",
        "data" => [
            "folio"          => $folio,
            "fecha_crea"     => $fecha_crea,
            "fecha_cierre"   => $fecha_cierre,
            "fecha_term"     => $fecha_term,
            "id_categoria"   => $id_categoria,
            "id_tecnico"     => $id_tecnico,
            "id_estado"      => $id_estado,
            "id_falla"       => $id_falla,
            "serie_bien"     => $serie_bien,
            "id_usuario"     => $id_usuario,
            "id_uso"         => $id_uso,
            "notas_solucion" => $notas_solucion,
            "id_evidencia"   => $id_evidencia,
            "categoria"      => $categoria,
            "estado"         => $estado,
            "falla"          => $falla,
            "id_ip"          => $id_ip,
            "id_propietario" => $id_propietario,
            "id_resg"        => $id_resg,
            "ip"             => $ip,
            "propietario"    => $propietario,
            "usuario_resg"   => $usuario_resg,
            "a_paterno_resg" => $a_paterno_resg,
            "a_materno_resg" => $a_materno_resg,
            "usuario_uso"    => $usuario_uso,
            "a_paterno_uso"  => $a_paterno_uso,
            "a_materno_uso"  => $a_materno_uso,
            "usuario_repor"   => $usuario_repor,
            "a_paterno_repor" => $a_paterno_repor,
            "a_materno_repor" => $a_materno_repor,
            "usuario_tec"   => $usuario_tec,
            "a_paterno_tec" => $a_paterno_tec,
            "a_materno_tec" => $a_materno_tec
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $e->getMessage()]);
}