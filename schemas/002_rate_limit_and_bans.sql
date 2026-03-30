-- ============================================================================
-- Migración: Rate Limiting persistente + Sistema de baneo en users2
-- Base de datos: Prueba3
-- Fecha: 2026-03-30
-- ============================================================================

-- ─── 1. Tabla de intentos de login (rate limiting persistente) ────────────────

CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`       VARCHAR(255)    NOT NULL COMMENT 'Email usado en el intento (puede no existir en users2)',
  `ip_address`  VARCHAR(45)     DEFAULT NULL COMMENT 'IPv4 o IPv6 del cliente',
  `attempted_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success`     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '0=fallido, 1=exitoso',
  PRIMARY KEY (`id`),
  KEY `idx_email_attempted` (`email`, `attempted_at`),
  KEY `idx_ip_attempted` (`ip_address`, `attempted_at`),
  KEY `idx_attempted_at` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro de intentos de login para rate limiting y auditoría';

-- ─── 2. Columnas de baneo en users2 ──────────────────────────────────────────

ALTER TABLE `users2`
  ADD COLUMN `banned_until` DATETIME DEFAULT NULL
    COMMENT 'NULL = no baneado. Fecha/hora hasta la cual el usuario está baneado'
    AFTER `is_active`,
  ADD COLUMN `ban_reason` VARCHAR(255) DEFAULT NULL
    COMMENT 'Motivo del baneo (automático o manual)'
    AFTER `banned_until`,
  ADD KEY `idx_banned_until` (`banned_until`);

-- ─── 3. Evento programado para limpiar intentos antiguos (>7 días) ───────────
-- Requiere que el event_scheduler esté habilitado en MariaDB:
--   SET GLOBAL event_scheduler = ON;
-- Editar archivo : /etc/mysql/mariadb.conf.d/50-server.cnf y agregar:
--   [mysqld]
--   event_scheduler=ON

DELIMITER $$
CREATE EVENT IF NOT EXISTS `cleanup_old_login_attempts`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  DELETE FROM `login_attempts`
  WHERE `attempted_at` < DATE_SUB(NOW(), INTERVAL 7 DAY);
END$$
DELIMITER ;
