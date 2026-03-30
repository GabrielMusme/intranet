import { db } from "./db";
import type mysql from "mysql2/promise";

// ─── Rate Limiting persistente en MariaDB ─────────────────────────────────────
// Usa la tabla `login_attempts` para contar intentos fallidos dentro de una
// ventana de tiempo. Sobrevive reinicios y funciona con múltiples instancias.

/**
 * Registra un intento de login (exitoso o fallido).
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string | null
): Promise<void> {
  await db.execute(
    `INSERT INTO login_attempts (email, ip_address, attempted_at, success)
     VALUES (?, ?, NOW(), ?)`,
    [email, ipAddress ?? null, success ? 1 : 0]
  );
}

/**
 * Cuenta los intentos fallidos de un email dentro de la ventana de tiempo.
 */
export async function getFailedAttempts(
  email: string,
  windowSeconds = 300,
  ipAddress?: string | null
): Promise<number> {
  const hasIp = Boolean(ipAddress);
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt
     FROM login_attempts
     WHERE (${hasIp ? "email = ? OR ip_address = ?" : "email = ?"})
       AND success = 0
       AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
    hasIp ? [email, ipAddress, windowSeconds] : [email, windowSeconds]
  );
  return Number(rows[0]?.cnt ?? 0);
}

/**
 * Verifica si un email tiene permitido intentar login
 * (no ha excedido el máximo de intentos en la ventana).
 */
export async function isAllowedLogin(
  email: string,
  maxAttempts = 5,
  windowSeconds = 300,
  ipAddress?: string | null
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
}> {
  const attempts = await getFailedAttempts(email, windowSeconds, ipAddress);
  const remaining = Math.max(0, maxAttempts - attempts);
  return {
    allowed: attempts < maxAttempts,
    limit: maxAttempts,
    remaining,
  };
}

/**
 * Registra un intento fallido (atajo de recordLoginAttempt).
 * Retorna la cantidad total de intentos fallidos en la ventana actual.
 */
export async function incrFailedLogin(
  email: string,
  windowSeconds = 300,
  ipAddress?: string | null
): Promise<number> {
  await recordLoginAttempt(email, false, ipAddress);
  return getFailedAttempts(email, windowSeconds, ipAddress);
}

/**
 * Elimina los intentos fallidos de un email (por ejemplo, tras un login exitoso).
 * Solo borra los fallidos; los exitosos se preservan para auditoría.
 */
export async function resetFailedLogin(email: string): Promise<void> {
  await db.execute(
    `DELETE FROM login_attempts
     WHERE email = ?
       AND success = 0`,
    [email]
  );
}
