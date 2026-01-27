<?php

// Manejador de cabeceras para que el acceso a la api

// Permitir origen específico para React en localhost:3000 donde se esta desarrollando el proyecto
header("Access-Control-Allow-Origin: http://localhost:3000");

// Permitir cabeceras necesarias
header("Access-Control-Allow-Headers: Content-Type");

// Métodos permitidos
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Para el uso de sesiones o cookies, habilitar las credenciales
header("Access-Control-Allow-Credentials: true");

// Responder preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Tipo de contenido por defecto
header("Content-Type: application/json; charset=UTF-8");
?>