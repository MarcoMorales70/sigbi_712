<?php
require_once __DIR__ . "/cors.php";
session_start();

// Responder preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include __DIR__ . "/conexion.php"; // aquí ya tienes $pdo definido

$data = json_decode(file_get_contents("php://input"), true);
$contrasena_nueva = $data['contrasena_nueva'] ?? null;

if (!isset($_SESSION['id_tecnico'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$id_tecnico = $_SESSION['id_tecnico'];

// Validar longitud mínima
if (strlen($contrasena_nueva) < 8) {
    echo json_encode(["status" => "error", "message" => "La nueva contraseña debe tener al menos 8 caracteres."]);
    exit;
}

// Generar hash seguro
$hash = password_hash($contrasena_nueva, PASSWORD_DEFAULT);

try {
    $sql_update = "UPDATE tecnicos SET contrasena = :contrasena WHERE id_tecnico = :id_tecnico";
    $stmt_update = $pdo->prepare($sql_update);
    $stmt_update->execute([
        "contrasena" => $hash,
        "id_tecnico" => $id_tecnico
    ]);

    if ($stmt_update->rowCount() > 0) {
        // destruir sesión
        session_unset();
        session_destroy();
        echo json_encode(["status" => "ok", "message" => "Contraseña actualizada y sesión cerrada."]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se actualizó la contraseña (verifica el ID)."]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al actualizar la contraseña: " . $e->getMessage()]);
}