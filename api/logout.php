<?php
require_once __DIR__ . "/cors.php";

session_start();
session_unset();
session_destroy();

echo json_encode(["status" => "ok", "message" => "Sesión cerrada"]);
exit;