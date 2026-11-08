<?php
/**
 * ============================================================================
 * ENDPOINT 4: AUTENTICACIÓN DEL PANEL DE LA NUTRIÓLOGA (NEUBOX PHP + SESIÓN)
 * Proyecto: Lic. Valeria de la Torre · Desarrollado por LeonardLance
 * ============================================================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

$configFile = file_exists(__DIR__ . '/config.local.php')
    ? __DIR__ . '/config.local.php'
    : __DIR__ . '/config.example.php';
require_once $configFile;

// Credenciales iniciales de la nutrióloga (en producción se recomienda validar contra tabla admin_usuarios con password_verify)
$adminEmail = defined('NUTRIOLOGA_EMAIL') ? NUTRIOLOGA_EMAIL : 'valeria.delatorre.nutricion@gmail.com';
$adminPassHash = password_hash('Valeria2026!', PASSWORD_DEFAULT);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'login';

    if ($action === 'logout') {
        session_destroy();
        echo json_encode(['ok' => true, 'loggedIn' => false]);
        exit;
    }

    $email = strtolower(trim($input['email'] ?? ''));
    $pass  = $input['password'] ?? '';

    if ($email === strtolower($adminEmail) && password_verify($pass, $adminPassHash)) {
        $_SESSION['vdt_admin_logged_in'] = true;
        $_SESSION['vdt_admin_email'] = $adminEmail;
        echo json_encode(['ok' => true, 'loggedIn' => true, 'email' => $adminEmail]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Credenciales inválidas']);
    exit;
}

echo json_encode([
    'ok' => true,
    'loggedIn' => !empty($_SESSION['vdt_admin_logged_in']),
    'email' => $_SESSION['vdt_admin_email'] ?? null
]);
