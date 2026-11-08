<?php
/**
 * ============================================================================
 * ENDPOINT 1: CREAR PREFERENCIA DE PAGO EN MERCADO PAGO (CHECKOUT PRO)
 * Alojamiento: Neubox cPanel (PHP 8+)
 * ============================================================================
 * Registra la solicitud de cita como "pendiente" (sin bloquear aún la hora en
 * el calendario definitivo) y devuelve el enlace de pago de Mercado Pago.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = file_exists(__DIR__ . '/config.local.php')
    ? __DIR__ . '/config.local.php'
    : __DIR__ . '/config.example.php';
require_once $configFile;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
    exit;
}

$folio           = 'VT-' . random_int(1000, 9999);
$pacienteNombre  = trim($input['patientName'] ?? '');
$pacienteEmail   = trim($input['patientEmail'] ?? '');
$pacienteTel     = trim($input['patientPhone'] ?? '');
$servicio        = trim($input['serviceName'] ?? 'Consulta de Valoración Nutricional Hormonal');
$modalidad       = trim($input['modality'] ?? 'Online (Videollamada Google Meet)');
$fechaCita       = trim($input['dateISO'] ?? date('Y-m-d'));
$horaCita        = trim($input['timeSlot'] ?? '11:00 AM');
$monto           = (float)($input['price'] ?? 850.00);
$notas           = trim($input['notes'] ?? '');

try {
    $pdo = getDbConnection();

    // 1. Verificar que ese horario no esté ya ocupado/pagado
    $stmtCheck = $pdo->prepare('SELECT COUNT(*) FROM horarios_bloqueados WHERE fecha = ? AND hora = ?');
    $stmtCheck->execute([$fechaCita, $horaCita]);
    if ($stmtCheck->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode([
            'ok' => false,
            'error' => 'Este horario acaba de ser reservado por otra paciente. Por favor elige otro horario.'
        ]);
        exit;
    }

    // 2. Armar la Preferencia de Mercado Pago Checkout Pro
    $preferenceData = [
        'items' => [
            [
                'id' => $folio,
                'title' => $servicio . ' — Lic. Valeria de la Torre',
                'description' => "Cita: $fechaCita a las $horaCita ($modalidad)",
                'quantity' => 1,
                'currency_id' => 'MXN',
                'unit_price' => $monto
            ]
        ],
        'payer' => [
            'name' => $pacienteNombre,
            'email' => $pacienteEmail
        ],
        'external_reference' => $folio,
        'back_urls' => [
            'success' => SITE_URL . '/index.html?pago=aprobado&folio=' . urlencode($folio),
            'failure' => SITE_URL . '/index.html?pago=rechazado&folio=' . urlencode($folio),
            'pending' => SITE_URL . '/index.html?pago=pendiente&folio=' . urlencode($folio)
        ],
        'auto_return' => 'approved',
        'notification_url' => SITE_URL . '/api/webhook-mercadopago.php'
    ];

    $ch = curl_init('https://api.mercadopago.com/checkout/preferences');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . MP_ACCESS_TOKEN
        ],
        CURLOPT_POSTFIELDS => json_encode($preferenceData)
    ]);
    $mpResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $mpData = json_decode($mpResponse, true);
    $preferenceId = $mpData['id'] ?? null;
    $initPoint    = $mpData['init_point'] ?? null;

    // 3. Guardar la pre-reserva como "pendiente" en MySQL (NO bloquea el horario hasta que Mercado Pago confirme el pago)
    $stmtInsert = $pdo->prepare('
        INSERT INTO reservas
        (folio, paciente_nombre, paciente_email, paciente_telefono, servicio, modalidad, fecha_cita, hora_cita, monto_mxn, notas, estado_pago, mp_preference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pendiente", ?)
    ');
    $stmtInsert->execute([
        $folio, $pacienteNombre, $pacienteEmail, $pacienteTel,
        $servicio, $modalidad, $fechaCita, $horaCita, $monto, $notas, $preferenceId
    ]);

    echo json_encode([
        'ok' => true,
        'folio' => $folio,
        'preferenceId' => $preferenceId,
        'initPoint' => $initPoint, // URL de Mercado Pago adonde redirigir al paciente
        'httpCode' => $httpCode
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
