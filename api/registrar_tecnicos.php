<?php
require_once __DIR__ . "/cors.php";
session_start();
include __DIR__ . "/conexion.php"; // aquí ya tienes $pdo definido

header("Content-Type: application/json; charset=UTF-8");

// =========================
// VALIDAR SESIÓN Y PERMISO
// =========================
if (!isset($_SESSION['identidad'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no iniciada."]);
    exit;
}

$permisos = $_SESSION['permisos'] ?? [];
if (!in_array(5, $permisos)) { // 5 = ID del permiso "Registrar técnicos"
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// =========================
// RECIBIR DATOS
// =========================
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico = $data['id_tecnico'] ?? null;
$id_rol     = $data['id_rol'] ?? null;
$id_estado  = $data['id_estado'] ?? null;

// =========================
// VALIDACIONES
// =========================
if (!$id_tecnico || !$id_rol || !$id_estado) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar todos los campos."]);
    exit;
}

if (!preg_match("/^\d{7}$/", $id_tecnico)) {
    echo json_encode(["status" => "error", "message" => "El ID técnico debe contener exactamente 7 dígitos."]);
    exit;
}

try {
    // =========================
    // OBTENER id_categoria
    // =========================
    $sqlCat = "SELECT id_categoria FROM roles WHERE id_rol = :id_rol";
    $stmtCat = $pdo->prepare($sqlCat);
    $stmtCat->execute(["id_rol" => $id_rol]);
    $rowCat = $stmtCat->fetch(PDO::FETCH_ASSOC);

    if (!$rowCat) {
        echo json_encode(["status" => "error", "message" => "El rol seleccionado no existe."]);
        exit;
    }

    $id_categoria = $rowCat['id_categoria'];

    // =========================
    // GENERAR codigo_temp
    // =========================
    function generarCodigoTemp($length = 6) {
        $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $codigo = "";
        for ($i = 0; $i < $length; $i++) {
            $codigo .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $codigo;
    }
    $codigo_temp = generarCodigoTemp();

    // =========================
    // INSERTAR EN TECNICOS
    // =========================
    $sqlInsert = "INSERT INTO tecnicos (id_tecnico, id_rol, id_categoria, id_estado, codigo_temp) 
                  VALUES (:id_tecnico, :id_rol, :id_categoria, :id_estado, :codigo_temp)";
    $stmtInsert = $pdo->prepare($sqlInsert);
    $okInsert = $stmtInsert->execute([
        "id_tecnico"   => $id_tecnico,
        "id_rol"       => $id_rol,
        "id_categoria" => $id_categoria,
        "id_estado"    => $id_estado,
        "codigo_temp"  => $codigo_temp
    ]);

    if ($okInsert) {
        // =========================
        // ASIGNAR PERMISOS
        // =========================
        $erroresPermisos = false;
        $sqlInsertPerm = "INSERT INTO permisos_tecnico (id_tecnico, id_permiso, fecha_asig) 
                          VALUES (:id_tecnico, :id_permiso, NOW())";
        $stmtInsertPerm = $pdo->prepare($sqlInsertPerm);

        if ($id_rol == 1) {
            // Administrador → todos los permisos
            $sqlTodos = "SELECT id_permiso FROM permisos";
            $stmtTodos = $pdo->query($sqlTodos);
            $todosPermisos = $stmtTodos->fetchAll(PDO::FETCH_COLUMN, 0);

            foreach ($todosPermisos as $id_permiso) {
                try {
                    $stmtInsertPerm->execute([
                        "id_tecnico" => $id_tecnico,
                        "id_permiso" => $id_permiso
                    ]);
                } catch (PDOException $e) {
                    $erroresPermisos = true;
                }
            }

        } else {
            // Rol distinto de admin → permisos por categoría + base
            $sqlPermCat = "SELECT id_permiso FROM permisos WHERE id_categoria = :id_categoria";
            $stmtPermCat = $pdo->prepare($sqlPermCat);
            $stmtPermCat->execute(["id_categoria" => $id_categoria]);
            $permisosCategoria = $stmtPermCat->fetchAll(PDO::FETCH_COLUMN, 0);

            $permisosBase = [1, 2, 3, 4, 46, 47, 48];
            $setFinal = array_unique(array_merge($permisosCategoria, $permisosBase));

            foreach ($setFinal as $id_permiso) {
                try {
                    $stmtInsertPerm->execute([
                        "id_tecnico" => $id_tecnico,
                        "id_permiso" => $id_permiso
                    ]);
                } catch (PDOException $e) {
                    $erroresPermisos = true;
                }
            }
        }

        if ($erroresPermisos) {
            echo json_encode([
                "status" => "warning",
                "message" => "Técnico registrado, pero hubo errores al asignar permisos.",
                "codigo_temp" => $codigo_temp
            ]);
        } else {
            echo json_encode([
                "status" => "ok",
                "message" => "Técnico registrado con permisos por defecto.",
                "codigo_temp" => $codigo_temp
            ]);
        }

    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al registrar el técnico. Posiblemente el ID ya existe."
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor: " . $e->getMessage()
    ]);
}