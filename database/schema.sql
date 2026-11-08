-- ============================================================================
-- ESQUEMA DE BASE DE DATOS MYSQL (NEUBOX CPANEL / PHPMYADMIN)
-- Proyecto: Lic. Valeria de la Torre — Nutrición Hormonal Femenina
-- Desarrollado por: LeonardLance
-- Horario oficial: 13:00 a 21:00 hrs (sesiones de 1 hora)
-- Tarifas: Virtual 1ª ($650), Virtual Seguimiento ($400), Presencial ($750)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `reservas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(20) NOT NULL UNIQUE,
  `paciente_nombre` VARCHAR(140) NOT NULL,
  `paciente_email` VARCHAR(140) NOT NULL,
  `paciente_telefono` VARCHAR(40) NOT NULL,
  `tipo_consulta` ENUM('primera', 'seguimiento') NOT NULL DEFAULT 'primera',
  `modalidad` ENUM('virtual', 'presencial') NOT NULL DEFAULT 'virtual',
  `enfoque_clinico` VARCHAR(140) NULL,
  `servicio` VARCHAR(160) NOT NULL,
  `fecha_cita` DATE NOT NULL,
  `hora_cita` VARCHAR(20) NOT NULL COMMENT 'Slots de 1h: 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00 (termina 21:00)',
  `monto_mxn` DECIMAL(10, 2) NOT NULL DEFAULT 650.00,
  `notas` TEXT NULL,
  `estado_pago` ENUM('pendiente', 'pagado', 'rechazado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  `cuestionario_completado` TINYINT(1) NOT NULL DEFAULT 0,
  `mp_preference_id` VARCHAR(120) NULL,
  `mp_payment_id` VARCHAR(80) NULL,
  `calendario_sincronizado` TINYINT(1) NOT NULL DEFAULT 0,
  `correos_enviados` TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_fecha_hora` (`fecha_cita`, `hora_cita`),
  INDEX `idx_paciente_email` (`paciente_email`),
  INDEX `idx_estado_pago` (`estado_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `horarios_bloqueados` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `fecha` DATE NOT NULL,
  `hora` VARCHAR(20) NOT NULL COMMENT '13:00 a 20:00 (bloques de 1 hora hasta las 21:00)',
  `motivo` VARCHAR(160) NOT NULL DEFAULT 'Bloqueado por Nutrióloga / Cita Pagada',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_fecha_hora` (`fecha`, `hora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preguntas del cuestionario de 1ª consulta (100% personalizable por la nutrióloga)
CREATE TABLE IF NOT EXISTS `cuestionario_preguntas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(32) NOT NULL UNIQUE,
  `etiqueta` VARCHAR(280) NOT NULL,
  `tipo` ENUM('text', 'textarea', 'single', 'multiple', 'scale', 'yesno') NOT NULL DEFAULT 'text',
  `opciones_json` JSON NULL COMMENT 'Arreglo JSON de opciones cuando tipo es single o multiple',
  `obligatoria` TINYINT(1) NOT NULL DEFAULT 1,
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respuestas de cada paciente al cuestionario de 1ª consulta
CREATE TABLE IF NOT EXISTS `cuestionario_respuestas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `folio_reserva` VARCHAR(20) NOT NULL,
  `paciente_email` VARCHAR(140) NOT NULL,
  `paciente_nombre` VARCHAR(140) NOT NULL,
  `respuestas_json` JSON NOT NULL,
  `enviado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_folio` (`folio_reserva`),
  INDEX `idx_email` (`paciente_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Eventos de analítica y mapa de calor (clics y tiempo por sección)
CREATE TABLE IF NOT EXISTS `analitica_eventos` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tipo_evento` ENUM('click', 'vista_seccion') NOT NULL,
  `seccion` VARCHAR(60) NOT NULL,
  `elemento` VARCHAR(140) NULL,
  `x_pct` DECIMAL(5, 4) NULL,
  `y_pct` DECIMAL(5, 4) NULL,
  `duracion_ms` INT UNSIGNED NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_seccion` (`seccion`),
  INDEX `idx_tipo` (`tipo_evento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Especialidades en Salud Hormonal administrables por la nutrióloga (si está vacía, la sección se oculta en la web)
CREATE TABLE IF NOT EXISTS `especialidades` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `etiqueta` VARCHAR(80) NOT NULL DEFAULT '🌿 Especialidad',
  `titulo` VARCHAR(160) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `precio_texto` VARCHAR(60) NOT NULL DEFAULT 'Desde $650 MXN',
  `tipo_preseleccion` ENUM('primera', 'seguimiento') NOT NULL DEFAULT 'primera',
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

