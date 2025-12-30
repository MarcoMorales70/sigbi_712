<?php
// ============================================================
//  ARCHIVO: bitacora.php
//  DESCRIPCIÓN: Función para registrar acciones en la bitácora
//  AUTOR: Marco (Sistema SIGBI)
// ============================================================

// IMPORTANTE: Ajusta la ruta a tu archivo de conexión
require_once "conexion.php";   // <-- tu archivo de conexión

/**
 * Registra un evento en la tabla bitacora.
 *
 * @param int $id_usuario              ID del usuario que realiza la acción
 * @param string $accion               Acción general (INSERT, UPDATE, LOGIN, etc.)
 * @param string $descripcion          Descripción detallada del evento
 * @param string|null $tabla_afectada  Nombre de la tabla afectada (opcional)
 * @param int|null $id_registro        ID del registro afectado (opcional)
 */
function registrarBitacora($id_usuario, $accion, $descripcion, $tabla_afectada = null, $id_registro = null) {
    global $conexion;

    // Obtener IP del usuario
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'DESCONOCIDA';

    // Obtener user agent (navegador/dispositivo)
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'DESCONOCIDO';

    // Preparar sentencia SQL
    $sql = "INSERT INTO bitacora 
            (id_usuario, accion, descripcion_detallada, tabla_afectada, id_registro_afectado, ip_origen, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        error_log("Error al preparar bitácora: " . $conexion->error);
        return false;
    }

    $stmt->bind_param(
        "isssiss",
        $id_usuario,
        $accion,
        $descripcion,
        $tabla_afectada,
        $id_registro,
        $ip,
        $user_agent
    );

    $stmt->execute();
    $stmt->close();

    return true;
}
?>