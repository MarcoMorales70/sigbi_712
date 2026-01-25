<?php

// Implementacion de cabeceras
require_once __DIR__ . "/cors.php";

// Manejo de pre-flight cors
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include __DIR__ . "/conexion.php"; // Con PDO definido

// Se valida el inicio de sesión
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

// Validación de permisos que tiene el usuario para usar esta api
$permisos = $_SESSION['permisos'] ?? [];
$permisosRequeridos = [7]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Se reciben los datos
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico     = $data['id_tecnico'] ?? null;
$id_rol         = $data['id_rol'] ?? null;
$id_estado      = $data['id_estado'] ?? null;
$permisosNuevos = $data['permisos'] ?? null;

if (!$id_tecnico || !$id_rol || !$id_estado) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

try {
    // Se obtiene la categoria dell nuevo rol, ya que si existe cambio de rol tambien cambia la categoría
    $sqlCat = "SELECT id_categoria FROM roles WHERE id_rol = :id_rol";
    $stmtCat = $pdo->prepare($sqlCat);
    $stmtCat->execute(["id_rol" => $id_rol]);
    $rowCat = $stmtCat->fetch(PDO::FETCH_ASSOC);

    if (!$rowCat) {
        echo json_encode(["status" => "error", "message" => "El rol seleccionado no existe."]);
        exit;
    }

    $id_categoria = $rowCat['id_categoria'];

    // Actualizar datos del técnico rol + categoría + estado
    
    $sqlUpdate = "UPDATE tecnicos 
                  SET id_rol = :id_rol, id_categoria = :id_categoria, id_estado = :id_estado 
                  WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sqlUpdate);
    $stmt->execute([
        "id_rol"       => $id_rol,
        "id_categoria" => $id_categoria,
        "id_estado"    => $id_estado,
        "id_tecnico"   => $id_tecnico
    ]);

    // Actualizar permisos
    $sqlDel = "DELETE FROM permisos_tecnico WHERE id_tecnico = :id_tecnico";
    $stmtDel = $pdo->prepare($sqlDel);
    $stmtDel->execute(["id_tecnico" => $id_tecnico]);

    // Sentencia para insertar con fecha_asig
    $sqlInsPerm = "INSERT INTO permisos_tecnico (id_tecnico, id_permiso, fecha_asig)
                   VALUES (:id_tecnico, :id_permiso, NOW())";
    $stmtInsPerm = $pdo->prepare($sqlInsPerm);

    if ($id_rol == 1) {
        // Administrador: asignar todos los permisos del sistema
        $sqlTodos = "SELECT id_permiso FROM permisos";
        $stmtTodos = $pdo->query($sqlTodos);
        $todosPermisos = $stmtTodos->fetchAll(PDO::FETCH_COLUMN, 0);

        foreach ($todosPermisos as $idPermiso) {
            $stmtInsPerm->execute([
                "id_tecnico" => $id_tecnico,
                "id_permiso" => $idPermiso
            ]);
        }

    } elseif (is_array($permisosNuevos) && count($permisosNuevos) > 0) {
        // Permisos manuales enviados por frontend (solo si hay al menos uno)
        $unicos = array_unique($permisosNuevos);

        foreach ($unicos as $idPermiso) {
            $stmtInsPerm->execute([
                "id_tecnico" => $id_tecnico,
                "id_permiso" => $idPermiso
            ]);
        }

    } else {
        // Rol distinto de 1 y sin permisos manuales, deberá asignar permisos por categoría + permisos base obligatorios
        $sqlPermCat = "SELECT id_permiso FROM permisos WHERE id_categoria = :id_categoria";
        $stmtPermCat = $pdo->prepare($sqlPermCat);
        $stmtPermCat->execute(["id_categoria" => $id_categoria]);
        $permisosCategoria = $stmtPermCat->fetchAll(PDO::FETCH_COLUMN, 0);

        $permisosBase = [1, 2, 3, 4, 46, 47, 48];
        $setFinal = array_unique(array_merge($permisosCategoria, $permisosBase));

        foreach ($setFinal as $idPermiso) {
            $stmtInsPerm->execute([
                "id_tecnico" => $id_tecnico,
                "id_permiso" => $idPermiso
            ]);
        }
    }

    echo json_encode(["status" => "ok", "message" => "Técnico modificado correctamente"]);

} catch (PDOException $e) { // Manejo de excepciones
    error_log("Error al modificar técnico: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Error al modificar técnico"]);
}

exit;