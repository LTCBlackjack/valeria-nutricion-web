<?php
/**
 * ============================================================================
 * ENDPOINT 3: CONSULTA Y ADMINISTRACIÓN DE HORARIOS EN TIEMPO REAL (MYSQL)
 * Alojamiento: Neubox cPanel (PHP 8+)
 * ============================================================================
 * - GET: Devuelve los horarios bloqueados y las reservas pagadas para el
 *        calendario del paciente (index.html) y el panel de la nutrióloga.
 * - POST: Permite a la nutrióloga bloquear o liberar un horario desde su panel.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = file_exists(__DIR__ . '/config.local.php')
    ? __DIR__ . '/config.local.php'
    : __DIR__ . '/config.example.php';
require_once $configFile;

try {
    $pdo = getDbConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // 1. Obtener horarios bloqueados
        $stmtBlk = $pdo->query('SELECT fecha, hora, motivo FROM horarios_bloqueados ORDER BY fecha ASC, hora ASC');
        $bloqueadosRows = $stmtBlk->fetchAll();

        $blockedByDay = [];
        foreach ($bloqueadosRows as $row) {
            $dayNum = (int)date('j', strtotime($row['fecha']));
            if (!isset($blockedByDay[$dayNum])) {
                $blockedByDay[$dayNum] = [];
            }
            if (!in_array($row['hora'], $blockedByDay[$dayNum], true)) {
                $blockedByDay[$dayNum][] = $row['hora'];
            }
        }

        // 2. Obtener reservas con pago confirmado ("pagado")
        $stmtRes = $pdo->query('
            SELECT folio, paciente_nombre AS patientName, paciente_email AS patientEmail,
                   paciente_telefono AS patientPhone, servicio AS serviceName,
                   modalidad AS modality, fecha_cita, hora_cita AS time,
                   monto_mxn AS price
            FROM reservas
            WHERE estado_pago = "pagado"
            ORDER BY fecha_cita DESC, id DESC
        ');
        $reservasPagadas = $stmtRes->fetchAll();

        foreach ($reservasPagadas as &$r) {
            $r['day'] = (int)date('j', strtotime($r['fecha_cita']));
            $r['dateLabel'] = date('d/m/Y', strtotime($r['fecha_cita']));
        }

        echo json_encode([
            'ok' => true,
            'blockedSlotsByDay' => $blockedByDay,
            'paidBookings' => $reservasPagadas
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? 'toggle_slot';
        $fecha  = $input['fecha'] ?? date('Y-m-d');
        $hora   = $input['hora'] ?? '';

        if ($action === 'toggle_slot' && !empty($hora)) {
            $stmtChk = $pdo->prepare('SELECT id FROM horarios_bloqueados WHERE fecha = ? AND hora = ?');
            $stmtChk->execute([$fecha, $hora]);
            $existingId = $stmtChk->fetchColumn();

            if ($existingId) {
                $stmtDel = $pdo->prepare('DELETE FROM horarios_bloqueados WHERE id = ?');
                $stmtDel->execute([$existingId]);
                $status = 'liberado';
            } else {
                $stmtIns = $pdo->prepare('INSERT INTO horarios_bloqueados (fecha, hora, motivo) VALUES (?, ?, "Bloqueado por Nutrióloga")');
                $stmtIns->execute([$fecha, $hora]);
                $status = 'bloqueado';
            }

            echo json_encode(['ok' => true, 'status' => $status, 'fecha' => $fecha, 'hora' => $hora]);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Solicitud no válida']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
