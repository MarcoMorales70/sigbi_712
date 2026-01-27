<?php

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuracion de php para no mostrar errores en pantalla (prueba)
ini_set('display_errors', 0);
error_reporting(0);


include __DIR__ . "/conexion.php"; // Con PDO definido

// Recibir datos
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico              = $data['id_tecnico'] ?? null;
$codigo_temp_ingresado   = $data['codigo_temp'] ?? null;
$contrasena              = $data['contrasena'] ?? null;
$contrasena_confirmacion = $data['contrasena_confirmacion'] ?? null;

// Normalizar código temporal a mayúsculas
$codigo_temp_ingresado = $codigo_temp_ingresado ? strtoupper($codigo_temp_ingresado) : null;

// Validaciones y respuestas json
if (!$id_tecnico || !$codigo_temp_ingresado || !$contrasena || !$contrasena_confirmacion) {
    echo json_encode([
        "status" => "error",
        "message" => "Debe ingresar todos los campos: ID técnico, código de registro y contraseñas."
    ]);
    exit;
}

if (!preg_match("/^\d{7}$/", $id_tecnico)) {
    echo json_encode([
        "status" => "error",
        "message" => "El ID técnico debe contener exactamente 7 dígitos."
    ]);
    exit;
}

if (!preg_match("/^[A-Z0-9]{6}$/", $codigo_temp_ingresado)) {
    echo json_encode([
        "status" => "error",
        "message" => "El código de registro debe tener exactamente 6 caracteres alfanuméricos (A-Z, 0-9)."
    ]);
    exit;
}

// Validar contraseña
// mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
$regex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';
if (!preg_match($regex, $contrasena)) {
    echo json_encode([
        "status" => "error",
        "message" => "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial."
    ]);
    exit;
}

// Validación de igualdad
if ($contrasena !== $contrasena_confirmacion) {
    echo json_encode([
        "status" => "error",
        "message" => "Las contraseñas no coinciden."
    ]);
    exit;
}

try {
    // Consulta
    $sqlTec = "SELECT codigo_temp FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmtTec = $pdo->prepare($sqlTec);
    $stmtTec->execute(["id_tecnico" => $id_tecnico]);
    $tec = $stmtTec->fetch();

    if (!$tec) {
        echo json_encode([
            "status" => "error",
            "message" => "El técnico no existe."
        ]);
        exit;
    }

    // Validar existencia de código_temp
    if (!$tec['codigo_temp']) {
        echo json_encode([
            "status" => "error",
            "message" => "No hay código de registro asignado. Solicítelo al administrador."
        ]);
        exit;
    }

    // Comparar código ingresado con el almacenado
    if (strtoupper($tec['codigo_temp']) !== $codigo_temp_ingresado) {
        echo json_encode([
            "status" => "error",
            "message" => "El código de registro no coincide."
        ]);
        exit;
    }

    // Actualizar registro
    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $sqlUpdate = "UPDATE tecnicos SET contrasena = :contrasena, codigo_temp = NULL WHERE id_tecnico = :id_tecnico";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([
        "contrasena" => $hash,
        "id_tecnico" => $id_tecnico
    ]);

    if ($stmtUpdate->rowCount() > 0) {
        echo json_encode([
            "status" => "ok",
            "message" => "Registro completado. Ahora puede iniciar sesión."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al completar el registro."
        ]);
    }

} catch (PDOException $e) { // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor: " . $e->getMessage()
    ]);
}