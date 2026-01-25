<?php
// Script para generar INSERT masivo en la tabla ips
// Marco - Sistema Institucional

// Nombre de la tabla
$tabla = "ips";

// Inicializamos la sentencia
$sql = "INSERT INTO $tabla (id_ip, ip) VALUES\n";

// Generamos los 255 registros
for ($i = 1; $i <= 255; $i++) {
    $sql .= "($i, 'Disponible')";
    // Agregamos coma excepto en el último registro
    if ($i < 255) {
        $sql .= ",\n";
    } else {
        $sql .= ";";
    }
}

// Mostramos el resultado
echo $sql;
?>