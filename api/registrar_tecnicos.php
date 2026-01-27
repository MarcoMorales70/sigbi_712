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
$permisosRequeridos = [5]; 
$interseccion = array_intersect($permisosRequeridos, $permisos);

if (empty($interseccion)) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit;
}

// Se reciben los datos
$data = json_decode(file_get_contents("php://input"), true);

$id_tecnico = $data['id_tecnico'] ?? null;
$id_rol     = $data['id_rol'] ?? null;
$id_estado  = $data['id_estado'] ?? null;

// Se realizan las validaciones
if (!$id_tecnico || !$id_rol || !$id_estado) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar todos los campos."]);
    exit;
}

if (!preg_match("/^\d{7}$/", $id_tecnico)) {
    echo json_encode(["status" => "error", "message" => "El ID técnico debe contener exactamente 7 dígitos."]);
    exit;
}

try {
    // Validar que el técnico exista en la tabla usuarios, porque solo siendo usuario se puede ser técnico
    $sqlUsuario = "SELECT id_usuario FROM usuarios WHERE id_usuario = :id_tecnico";
    $stmtUsuario = $pdo->prepare($sqlUsuario);
    $stmtUsuario->execute(["id_tecnico" => $id_tecnico]);
    $rowUsuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

    if (!$rowUsuario) {
        echo json_encode([
            "status" => "error",
            "message" => "El empleado con ID $id_tecnico no pertenece a la UA-712."
        ]);
        exit;
    }

    // Se obtiene la categoría del rol
    $sqlCat = "SELECT id_categoria FROM roles WHERE id_rol = :id_rol";
    $stmtCat = $pdo->prepare($sqlCat);
    $stmtCat->execute(["id_rol" => $id_rol]);
    $rowCat = $stmtCat->fetch(PDO::FETCH_ASSOC);

    if (!$rowCat) {
        echo json_encode(["status" => "error", "message" => "El rol seleccionado no existe."]);
        exit;
    }

    $id_categoria = $rowCat['id_categoria'];

    // Se genera un código aleatorio
    function generarCodigoTemp($length = 6) {
        $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $codigo = "";
        for ($i = 0; $i < $length; $i++) {
            $codigo .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $codigo;
    }
    $codigo_temp = generarCodigoTemp();

    // Se realiza el registro en tecnicos
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
        // Se asignan permisos
        $erroresPermisos = false;
        $sqlInsertPerm = "INSERT INTO permisos_tecnico (id_tecnico, id_permiso, fecha_asig) 
                          VALUES (:id_tecnico, :id_permiso, NOW())";
        $stmtInsertPerm = $pdo->prepare($sqlInsertPerm);

        if ($id_rol == 1) {
            // Si el rol seleccionado es administrador, se le asignan todos los permisos
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
            // Si el rol es distinto de administrador, se le asignan los permisos por categoría más los permisos base
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

        // Validaciones y respuestas json
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

} catch (PDOException $e) {     // Manejo de excepciones
    echo json_encode([
        "status" => "error",
        "message" => "Error interno en el servidor: " . $e->getMessage()
    ]);
}