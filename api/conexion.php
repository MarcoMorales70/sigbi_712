<?php
header("Content-Type: application/json; charset=UTF-8");

// Parámetros de conexión
$host = "localhost";
$user = "root";
$pass = "";
$db   = "sigbi_db";

try {
    // Crear conexión con PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);

    // Configurar atributos de PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // errores como excepciones
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // resultados como array asociativo

} catch (PDOException $e) {
    // Si falla la conexión, devolver JSON con el error
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión: " . $e->getMessage()
    ]);
    exit;
}
?>