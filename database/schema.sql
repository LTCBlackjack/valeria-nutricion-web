-- ============================================================================
-- ESQUEMA DE BASE DE DATOS MYSQL (NEUBOX CPANEL / PHPMYADMIN)
-- Proyecto: Lic. Valeria de la Torre — Nutrición Hormonal Femenina
-- Desarrollado por: LeonardLance
-- ============================================================================

CREATE TABLE IF NOT EXISTS `reservas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(20) NOT NULL UNIQUE,
  `paciente_nombre` VARCHAR(140) NOT NULL,
  `paciente_email` VARCHAR(140) NOT NULL,
  `paciente_telefono` VARCHAR(40) NOT NULL,
  `servicio` VARCHAR(140) NOT NULL,
  `modalidad` VARCHAR(80) NOT NULL,
  `fecha_cita` DATE NOT NULL,
  `hora_cita` VARCHAR(20) NOT NULL,
  `monto_mxn` DECIMAL(10, 2) NOT NULL DEFAULT 850.00,
  `notas` TEXT NULL,
  `estado_pago` ENUM('pendiente', 'pagado', 'rechazado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  `mp_preference_id` VARCHAR(120) NULL,
  `mp_payment_id` VARCHAR(80) NULL,
  `calendario_sincronizado` TINYINT(1) NOT NULL DEFAULT 0,
  `correos_enviados` TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_fecha_hora` (`fecha_cita`, `hora_cita`),
  INDEX `idx_estado_pago` (`estado_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `horarios_bloqueados` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `fecha` DATE NOT NULL,
  `hora` VARCHAR(20) NOT NULL,
  `motivo` VARCHAR(160) NOT NULL DEFAULT 'Bloqueado por Nutrióloga / Cita Pagada',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_fecha_hora` (`fecha`, `hora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
