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


// Importar PHPMailer desde la carpeta src está un nivel arriba de esta api
require __DIR__ . '/../src/PHPMailer.php';
require __DIR__ . '/../src/SMTP.php';
require __DIR__ . '/../src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);
$id_tecnico = $data['id_tecnico'] ?? null;
$codigo_temp = $data['codigo_temp'] ?? null;

if (!$id_tecnico || !$codigo_temp) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    // Validar técnico y código
    $sql = "SELECT codigo_temp FROM tecnicos WHERE id_tecnico = :id_tecnico";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_tecnico" => $id_tecnico]);
    $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tecnico) {
        echo json_encode(["status" => "error", "message" => "El técnico no existe."]);
        exit;
    }

    if ($tecnico['codigo_temp'] !== $codigo_temp) {
        echo json_encode(["status" => "error", "message" => "El código temporal no coincide."]);
        exit;
    }

    // Obtener correo del usuario
    $sqlCorreo = "SELECT correo FROM usuarios WHERE id_usuario = :id_tecnico";
    $stmtCorreo = $pdo->prepare($sqlCorreo);
    $stmtCorreo->execute(["id_tecnico" => $id_tecnico]);
    $usuario = $stmtCorreo->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(["status" => "error", "message" => "No se encontró correo asociado."]);
        exit;
    }

    $destinatario = $usuario['correo'];

    // Preparar enlace de restablecimiento
    $enlace = "https://tusistema.com/reset_password.php?id_tecnico=$id_tecnico&token=$codigo_temp";

    // Enviar correo
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.office365.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'marco.moralesl@outlook.com';
        $mail->Password   = 'Pollo_2011';
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('podriterrestre@outlook.com', 'Sistema SIGBI');
        $mail->addAddress($destinatario);

        $mail->isHTML(true);
        $mail->Subject = "Restablecimiento de contraseña";
        $mail->Body    = "Ha solicitado restablecer su contraseña.<br>
                          Haga clic en el siguiente enlace para definir una nueva:<br>
                          <a href='$enlace'>$enlace</a>";

        $mail->send();

        echo json_encode(["status" => "ok", "message" => "Se envió un enlace de restablecimiento a su correo institucional."]);

    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "No se pudo enviar el correo. Error: {$mail->ErrorInfo}"]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error en la operación: " . $e->getMessage()]);
}