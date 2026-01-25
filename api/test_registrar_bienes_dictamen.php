<?php
// Script de prueba para registrar bienes en un dictamen

$url = "http://localhost/sigbi_712/api/registrar_bienes_dictamen.php";

// Datos de prueba (ajusta con un id_dictamen real y serie_bien existentes en tu BD)
$payload = [
    "id_dictamen" => 203001,
    "bienes" => ["SERIE123", "SERIE456"] // 👈 usa series reales de tu tabla bienes con id_estado=3
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_COOKIE, "PHPSESSID=" . session_id()); // 👈 si necesitas sesión activa

$response = curl_exec($ch);
if ($response === false) {
    echo "Error en cURL: " . curl_error($ch);
} else {
    echo "Respuesta de la API:\n";
    echo $response;
}
curl_close($ch);