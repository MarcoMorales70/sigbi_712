<?php.

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php"; 

// Manejo de pre-flight cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit;
}

session_start();   

include __DIR__ . "/conexion.php"; // Con PDO definido

$data = json_decode(file_get_contents("php://input"), true);    // Conversión en array el cuerpo de la petición
$contrasena_nueva = $data['contrasena_nueva'] ?? null;  // Se extrae y almacena la nueva contraseña enviada por el frontend

if (!isset($_SESSION['id_tecnico'])) {  // Verificación de técnico autenticado
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}
$id_tecnico = $_SESSION['id_tecnico'];  // Si existe la sesión guarda el valor en $id_tecnico

$regex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/'; // Definición de las reglas de complejidad de contraseña, mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
if (!preg_match($regex, $contrasena_nueva)) { // Comparación entre la contraseña y el patron definido
    echo json_encode([  // Respuesta en caso de error
        "status" => "error",
        "message" => "La nueva contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial."
    ]);
    exit;
}

$hash = password_hash($contrasena_nueva, PASSWORD_DEFAULT); // Generar hash seguro

try {
    // Consulta
    $sql_update = "UPDATE tecnicos SET contrasena = :contrasena WHERE id_tecnico = :id_tecnico"; // Actualización de datos en la base de datos
    $stmt_update = $pdo->prepare($sql_update); // Se crea el objeto PDO con la sentencia creada
    $stmt_update->execute([     // Se ejecuta la consulta con los parametros
        "contrasena" => $hash,  // Contraseña encriptada
        "id_tecnico" => $id_tecnico // Se asigna el valor de id_tecnico
    ]);

    if ($stmt_update->rowCount() > 0) {     // Se verifica el resultado
        session_unset();    // Se eliminan variables de sesión
        session_destroy();  // Se destruye la sesión
        echo json_encode(["status" => "ok", "message" => "Contraseña actualizada y sesión cerrada."]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se actualizó la contraseña (verifica el ID)."]);
    }
} catch (PDOException $e) {    // Manejo de errores
    echo json_encode(["status" => "error", "message" => "Error al actualizar la contraseña: " . $e->getMessage()]);
}