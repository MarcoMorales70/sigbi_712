<?php

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php";

session_start();    // Inicia sesión, necesario para poder destruirla
session_unset();    // Limpia las variables de sesión
session_destroy();  // Destruye la sesión

// Respuesta json
echo json_encode([
    "status" => "ok",
    "message" => "Sesión cerrada"
]);
exit; // Ya no ejecutar nada