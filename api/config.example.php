<?php
/**
 * ============================================================================
 * CONFIGURACIÓN PARA NEUBOX CPANEL + MERCADO PAGO + CORREOS
 * ============================================================================
 * Instrucciones en Neubox:
 * Renombra este archivo a "config.local.php" y coloca los datos reales de tu cPanel.
 */

// 1. Base de Datos MySQL creada en el cPanel de Neubox
define('DB_HOST', 'localhost');
define('DB_NAME', 'usuario_valeria_db');
define('DB_USER', 'usuario_valeria_admin');
define('DB_PASS', 'TuPasswordSeguroDeCPanel');

// 2. Credenciales de Mercado Pago (Panel de Desarrolladores de Mercado Libre / Mercado Pago)
define('MP_ACCESS_TOKEN', 'APP_USR-0000000000000000-000000-xxxxxxxxxxxxxxxxxxxx-000000000');
define('MP_PUBLIC_KEY',   'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

// 3. Correos y Dominio alojado en Neubox
define('SITE_URL', 'https://tudominio.com');
define('NUTRIOLOGA_EMAIL', 'valeria.delatorre.nutricion@gmail.com');
define('SENDER_EMAIL', 'citas@tudominio.com'); // Correo corporativo creado en cPanel de Neubox
define('SENDER_NAME', 'Lic. Valeria de la Torre · Nutrición Hormonal');

function getDbConnection(): PDO {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
