<?php

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;
$contrasena = $data['contrasena'] ?? null;

if (!$id_tecnico || !$contrasena) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar ID técnico y contraseña."]);
    exit;
}

include __DIR__ . "/conexion.php"; // Con PDO definido

try {
    // Consulta
    $sql = "SELECT contrasena, id_estado 
            FROM tecnicos 
            WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "El técnico no existe."]);
        exit;
    }

    // Validacion de estado
    if ((int)$tecnico['id_estado'] !== 6) {
        echo json_encode(["status" => "error", "message" => "El usuario no está activo."]);
        exit;
    }

    // Validar contraseña con hash
    if (!password_verify($contrasena, $tecnico['contrasena'])) {
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
        exit;
    }

    // Guardar en sesión (temporal)
    $_SESSION['id_tecnico'] = $id_tecnico;

    echo json_encode(["status" => "ok", "message" => "Credenciales validadas."]);

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor: " . $e->getMessage()
    ]);
}