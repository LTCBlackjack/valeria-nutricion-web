<?php
/**
 * ============================================================================
 * ENDPOINT PHP PARA NEUBOX: REPROGRAMACIÓN Y AVISO DE EMERGENCIA POR CORREO
 * Proyecto: Lic. Valeria de la Torre · Nutrición Hormonal Femenina
 * Desarrollado por: LeonardLance
 * ============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || empty($data['patientEmail']) || empty($data['folio'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Datos incompletos para reprogramación.']);
    exit;
}

$mode         = $data['mode'] ?? 'emergency'; // 'emergency' | 'direct'
$folio        = htmlspecialchars($data['folio']);
$patientName  = htmlspecialchars($data['patientName'] ?? 'Paciente');
$patientEmail = filter_var($data['patientEmail'], FILTER_SANITIZE_EMAIL);
$reason       = htmlspecialchars($data['reason'] ?? 'Ajuste imprevisto en la agenda de la Lic. Valeria de la Torre.');
$portalUrl    = htmlspecialchars($data['portalUrl'] ?? 'https://valeriadelatorre.com/paciente.html');
$newDateLabel = htmlspecialchars($data['newDateLabel'] ?? '');
$newTimeLabel = htmlspecialchars($data['newTimeLabel'] ?? '');

if ($mode === 'direct') {
    $subject = "Actualización de Fecha de tu Consulta ($folio) — Lic. Valeria de la Torre";
    $htmlMessage = "
    <div style='font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 30px; border-radius: 18px; border: 1px solid #DEB074; color: #253B2E;'>
        <h2 style='color: #253B2E; margin-top: 0;'>Tu consulta ha sido reprogramada</h2>
        <p>Hola <strong>{$patientName}</strong>,</p>
        <p>Te confirmamos que tu consulta con la <strong>Lic. Valeria de la Torre</strong> (Folio: <strong>{$folio}</strong>) ha quedado agendada en su nueva fecha y horario:</p>
        <div style='background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #A77237; margin: 18px 0;'>
            <strong>Nueva Fecha:</strong> {$newDateLabel}<br>
            <strong>Nuevo Horario:</strong> {$newTimeLabel} hrs (Sesión de 1 hora)
        </div>
        <p>Puedes consultar los detalles en cualquier momento desde tu Portal de Paciente:</p>
        <p style='margin: 24px 0;'>
            <a href='{$portalUrl}' style='background: #253B2E; color: #FEFAFA; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: bold; display: inline-block;'>Ir a Mi Portal de Paciente →</a>
        </p>
        <p style='font-size: 12px; color: #5E6E58; margin-top: 28px;'>Lic. Valeria de la Torre · Nutrición Hormonal Femenina</p>
    </div>";
} else {
    $subject = "Aviso Importante: Elige el Nuevo Día de tu Consulta ($folio) — Lic. Valeria de la Torre";
    $htmlMessage = "
    <div style='font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 30px; border-radius: 18px; border: 1px solid #DEB074; color: #253B2E;'>
        <h2 style='color: #8C5820; margin-top: 0;'>Aviso sobre tu Consulta ({$folio})</h2>
        <p>Hola <strong>{$patientName}</strong>,</p>
        <p>{$reason}</p>
        <p>Hemos habilitado en tu <strong>Portal de Paciente</strong> un selector especial para que elijas <strong>sin ningún costo adicional</strong> el nuevo día y horario que mejor se adapte a ti:</p>
        <p style='margin: 26px 0;'>
            <a href='{$portalUrl}' style='background: #A77237; color: #FEFAFA; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold; display: inline-block;'>Elegir mi Nuevo Día y Horario →</a>
        </p>
        <p style='font-size: 13px; color: #4A5B4F;'>Folio de acceso: <strong>{$folio}</strong> · Correo: <strong>{$patientEmail}</strong></p>
        <p style='font-size: 12px; color: #5E6E58; margin-top: 28px;'>Con cariño,<br><strong>Lic. Valeria de la Torre</strong> · Nutrición Hormonal Femenina</p>
    </div>";
}

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Lic. Valeria de la Torre <contacto@valeriadelatorre.com>\r\n";
$headers .= "Reply-To: valeria.delatorre.nutricion@gmail.com\r\n";

$sent = @mail($patientEmail, $subject, $htmlMessage, $headers);

echo json_encode([
    'ok' => true,
    'mailSent' => (bool)$sent,
    'mode' => $mode,
    'folio' => $folio,
    'patientEmail' => $patientEmail
]);
