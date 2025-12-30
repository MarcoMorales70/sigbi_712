<?php
// Cabecera siempre al inicio
header("Content-Type: application/json; charset=UTF-8");

// Parámetros de conexión
$host = "localhost";
$user = "root";
$pass = "";
$db   = "sigbi_db";

// Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// Validar conexión
if ($conn->connect_error) {
    // Se detiene y devuelve JSON con el error
    die(json_encode([
        "status" => "error",
        "message" => "Error de conexión: " . $conn->connect_error
    ]));
}

// Establecer charset para evitar problemas con acentos/ñ
$conn->set_charset("utf8");
?>