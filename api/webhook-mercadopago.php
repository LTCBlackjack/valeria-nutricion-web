<?php
/**
 * ============================================================================
 * ENDPOINT 2: WEBHOOK OFICIAL DE MERCADO PAGO + CALENDARIO Y CORREOS DUALES
 * Alojamiento: Neubox cPanel (PHP 8+)
 * ============================================================================
 * REGLA DE NEGOCIO ESTRICTA:
 * Únicamente cuando Mercado Pago confirma que el pago fue "approved" (pagado):
 *   1. Se cambia el estado de la reserva a "pagado".
 *   2. Se bloquea el horario en la tabla "horarios_bloqueados".
 *   3. Se envía el correo de confirmación + enlace de Calendario al Paciente.
 *   4. Se envía el correo de notificación + datos del paciente a la Nutrióloga.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = file_exists(__DIR__ . '/config.local.php')
    ? __DIR__ . '/config.local.php'
    : __DIR__ . '/config.example.php';
require_once $configFile;

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true) ?? [];

// Mercado Pago envía el ID del pago por query string o en data.id
$paymentId = $_GET['data_id'] ?? $_GET['id'] ?? ($payload['data']['id'] ?? null);

if (!$paymentId) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'msg' => 'Webhook recibido sin paymentId']);
    exit;
}

try {
    // 1. Consultar el estado real del pago directamente en la API de Mercado Pago
    $ch = curl_init('https://api.mercadopago.com/v1/payments/' . urlencode((string)$paymentId));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . MP_ACCESS_TOKEN
        ]
    ]);
    $mpPayResp = curl_exec($ch);
    curl_close($ch);

    $paymentInfo = json_decode($mpPayResp, true);
    $status      = $paymentInfo['status'] ?? '';
    $folio       = $paymentInfo['external_reference'] ?? '';

    // Si NO está pagado (approved), no agendamos ni enviamos correos
    if ($status !== 'approved' || empty($folio)) {
        http_response_code(200);
        echo json_encode([
            'ok' => false,
            'msg' => "Pago aún no aprobado (status: $status). No se bloquea horario."
        ]);
        exit;
    }

    $pdo = getDbConnection();

    // 2. Buscar la reserva por su folio
    $stmt = $pdo->prepare('SELECT * FROM reservas WHERE folio = ? LIMIT 1');
    $stmt->execute([$folio]);
    $reserva = $stmt->fetch();

    if (!$reserva) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Reserva no encontrada']);
        exit;
    }

    // Evitar enviar correos duplicados si Mercado Pago reintenta el webhook
    if ($reserva['estado_pago'] === 'pagado' && (int)$reserva['correos_enviados'] === 1) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'msg' => 'Reserva ya procesada previamente']);
        exit;
    }

    // 3. Actualizar reserva a "pagado" y bloquear horario en la agenda
    $pdo->beginTransaction();

    $stmtUpd = $pdo->prepare('
        UPDATE reservas
        SET estado_pago = "pagado",
            mp_payment_id = ?,
            calendario_sincronizado = 1,
            correos_enviados = 1
        WHERE id = ?
    ');
    $stmtUpd->execute([(string)$paymentId, $reserva['id']]);

    $stmtBlk = $pdo->prepare('
        INSERT IGNORE INTO horarios_bloqueados (fecha, hora, motivo)
        VALUES (?, ?, ?)
    ');
    $stmtBlk->execute([
        $reserva['fecha_cita'],
        $reserva['hora_cita'],
        'Cita Pagada (' . $folio . ') - ' . $reserva['paciente_nombre']
    ]);

    $pdo->commit();

    // 4. Construir enlace directo a Google Calendar para ambos correos
    $fechaLimpia = str_replace('-', '', $reserva['fecha_cita']);
    $gcalTitle   = rawurlencode($reserva['servicio'] . ' - Lic. Valeria de la Torre');
    $gcalDetails = rawurlencode(
        "Reserva Pagada ($folio)\nPaciente: {$reserva['paciente_nombre']}\nTeléfono: {$reserva['paciente_telefono']}\nModalidad: {$reserva['modalidad']}"
    );
    $gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text={$gcalTitle}&dates={$fechaLimpia}T110000/{$fechaLimpia}T120000&details={$gcalDetails}";

    // 5. Enviar los 2 Correos Electrónicos desde el servidor de Neubox
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . SENDER_NAME . ' <' . SENDER_EMAIL . '>',
        'Reply-To: ' . NUTRIOLOGA_EMAIL
    ];
    $headersStr = implode("\r\n", $headers);

    // Correo #1: Al Paciente
    $asuntoPaciente = "✅ Confirmación de tu Consulta ($folio) — Lic. Valeria de la Torre";
    $htmlPaciente = "
      <div style='font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FEFAFA; border: 1px solid #DEB074; border-radius: 16px; padding: 28px; color: #253B2E;'>
        <h2 style='color: #A77237; margin-top: 0;'>¡Tu Reserva está Pagada y Confirmada!</h2>
        <p>Hola <strong>{$reserva['paciente_nombre']}</strong>,</p>
        <p>Tu pago de <strong>\${$reserva['monto_mxn']} MXN</strong> mediante Mercado Pago fue acreditado exitosamente (Folio: <strong>{$folio}</strong>).</p>
        <div style='background: #FAF6F0; border-left: 4px solid #3D5540; padding: 16px; margin: 20px 0;'>
          <p style='margin: 4px 0;'><strong>Especialista:</strong> Lic. Valeria de la Torre</p>
          <p style='margin: 4px 0;'><strong>Consulta:</strong> {$reserva['servicio']}</p>
          <p style='margin: 4px 0;'><strong>Fecha y Hora:</strong> {$reserva['fecha_cita']} · {$reserva['hora_cita']}</p>
          <p style='margin: 4px 0;'><strong>Modalidad:</strong> {$reserva['modalidad']}</p>
        </div>
        <p style='text-align: center; margin: 24px 0;'>
          <a href='{$gcalUrl}' style='background: #3D5540; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;'>
            📅 Agregar Cita a mi Calendario
          </a>
        </p>
      </div>
    ";

    // Correo #2: A la Nutrióloga (Lic. Valeria de la Torre)
    $asuntoNutriologa = "🔔 Nueva Reserva Pagada ($folio): {$reserva['paciente_nombre']} ({$reserva['fecha_cita']} · {$reserva['hora_cita']})";
    $htmlNutriologa = "
      <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #3D5540; border-radius: 16px; padding: 28px; color: #253B2E;'>
        <h2 style='color: #3D5540; margin-top: 0;'>🔔 Nueva Consulta Pagada en Mercado Pago</h2>
        <p>Hola <strong>Lic. Valeria</strong>, se ha confirmado el pago de una nueva reserva:</p>
        <ul>
          <li><strong>Folio:</strong> {$folio} (\${$reserva['monto_mxn']} MXN - PAGADO)</li>
          <li><strong>ID Pago Mercado Pago:</strong> {$paymentId}</li>
          <li><strong>Paciente:</strong> {$reserva['paciente_nombre']}</li>
          <li><strong>Correo del Paciente:</strong> {$reserva['paciente_email']}</li>
          <li><strong>WhatsApp / Teléfono:</strong> {$reserva['paciente_telefono']}</li>
          <li><strong>Consulta:</strong> {$reserva['servicio']} ({$reserva['modalidad']})</li>
          <li><strong>Fecha y Hora:</strong> {$reserva['fecha_cita']} a las {$reserva['hora_cita']}</li>
        </ul>
        <p style='margin-top: 20px;'>
          <a href='{$gcalUrl}' style='background: #A77237; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 999px; font-size: 13px; font-weight: bold;'>
            📅 Guardar / Ver en Google Calendar
          </a>
        </p>
      </div>
    ";

    @mail($reserva['paciente_email'], $asuntoPaciente, $htmlPaciente, $headersStr);
    @mail(NUTRIOLOGA_EMAIL, $asuntoNutriologa, $htmlNutriologa, $headersStr);

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'folio' => $folio,
        'status' => 'pagado_y_agendado'
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
