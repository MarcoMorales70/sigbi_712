<?php
require_once __DIR__ . "/cors.php";
include __DIR__ . "/conexion.php"; // aquí ya tienes $pdo definido

// =========================
// INICIAR SESIÓN PHP
// =========================
// Si ya existía una sesión activa, la limpiamos para evitar conflictos
if (session_status() === PHP_SESSION_ACTIVE) {
    session_unset();
    session_destroy();
}
session_start();

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;
$contrasena = $data['contrasena'] ?? null;

if (!$id_tecnico || !$contrasena) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar usuario y contraseña."]);
    exit;
}

try {
    // =========================
    // CONSULTA PRINCIPAL
    // =========================
    $sql = "SELECT t.id_tecnico, t.contrasena, t.id_estado, t.id_rol, t.id_categoria,
                   u.id_usuario, u.usuario, u.a_paterno, u.a_materno, u.correo,
                   u.id_cargo, u.id_direccion, u.id_sede, u.id_edificio, u.id_nivel,
                   r.rol, c.categoria
            FROM tecnicos t
            INNER JOIN usuarios u ON u.id_usuario = t.id_tecnico
            INNER JOIN roles r ON r.id_rol = t.id_rol
            INNER JOIN categorias c ON c.id_categoria = t.id_categoria
            WHERE t.id_tecnico = :id_tecnico";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "El usuario no existe."]);
        exit;
    }

    // =========================
    // VALIDAR CONTRASEÑA (con hash)
    // =========================
    if (!password_verify($contrasena, $tecnico['contrasena'])) {
        echo json_encode(["status" => "error", "message" => "Contraseña incorrecta."]);
        exit;
    }

    // =========================
    // VALIDAR ESTADO
    // =========================
    if ((int)$tecnico['id_estado'] !== 6) {
        echo json_encode(["status" => "error", "message" => "El usuario está inactivo."]);
        exit;
    }

    // =========================
    // ARMAR IDENTIDAD
    // =========================
    $nombre_completo = trim($tecnico['usuario'] . ' ' . $tecnico['a_paterno'] . ' ' . $tecnico['a_materno']);

    $identidad = [
        "id_tecnico"   => (int)$tecnico['id_tecnico'],
        "id_usuario"   => (int)$tecnico['id_usuario'],
        "nombre"       => $nombre_completo,
        "correo"       => $tecnico['correo'],
        "rol"          => $tecnico['rol'],
        "id_rol"       => (int)$tecnico['id_rol'],
        "id_categoria" => (int)$tecnico['id_categoria'],
        "categoria"    => $tecnico['categoria'],
        "id_cargo"     => (int)$tecnico['id_cargo'],
        "id_direccion" => (int)$tecnico['id_direccion'],
        "id_sede"      => (int)$tecnico['id_sede'],
        "id_edificio"  => (int)$tecnico['id_edificio'],
        "id_nivel"     => (int)$tecnico['id_nivel']
    ];

    // =========================
    // OBTENER PERMISOS
    // =========================
    $sqlPerm = "SELECT id_permiso FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtPerm = $pdo->prepare($sqlPerm);
    $stmtPerm->execute(["id_tecnico" => $id_tecnico]);
    $permisos = [];
    foreach ($stmtPerm->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $permisos[] = (int)$row['id_permiso'];
    }

    // =========================
    // GUARDAR EN SESIÓN PHP
    // =========================
    $_SESSION['identidad'] = $identidad;
    $_SESSION['permisos'] = $permisos;

    // =========================
    // RESPUESTA FINAL
    // =========================
    echo json_encode([
        "status" => "ok",
        "message" => "Inicio de sesión exitoso.",
        "identidad" => $identidad,
        "permisos" => $permisos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor: " . $e->getMessage()
    ]);
}