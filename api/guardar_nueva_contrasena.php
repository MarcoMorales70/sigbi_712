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

$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;
$token = $data['token'] ?? null;
$nueva_contrasena = $data['nueva_contrasena'] ?? null;

if (!$id_tecnico || !$token || !$nueva_contrasena) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    // Validar técnico y token
    $sql = "SELECT codigo_temp FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico || $tecnico['codigo_temp'] !== $token) {
        echo json_encode(["status" => "error", "message" => "Token inválido o expirado."]);
        exit;
    }

    // Hashear nueva contraseña
    $hash = password_hash($nueva_contrasena, PASSWORD_BCRYPT);

    // Actualizar bd y eliminar token
    $sqlUpdate = "UPDATE tecnicos SET contrasena = :hash, codigo_temp = NULL WHERE id_tecnico = :id_tecnico";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([
        "hash" => $hash,
        "id_tecnico" => $id_tecnico
    ]);

    // Respuestas json
    echo json_encode(["status" => "ok", "message" => "Contraseña restablecida correctamente."]);

} catch (PDOException $e) {     // Manejo de excepciones
    echo json_encode(["status" => "error", "message" => "Error en la operación: " . $e->getMessage()]);
}