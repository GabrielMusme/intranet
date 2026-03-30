import mysql from "mysql2/promise";

// Re-export para compatibilidad con código legacy (intema.actions.ts, etc.)
export type { RowDataPacket, ResultSetHeader } from "mysql2";

// ─── Interfaces de dominio ────────────────────────────────────────────────────

/** Usuario de autenticación (tabla users2) */
export interface DbAuthUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: "user" | "admin";
  is_active: boolean;
  banned_until: Date | null;
  ban_reason: string | null;
  last_login: Date | null;
}

/** Miembro del instituto (tabla members) */
export interface DbMember {
  id: number;
  last_name: string;
  first_name: string;
  doc_type_id: number;
  doc_number: string;
  birth_date: Date;
  nationality_id: number;
  gender_id: number;
  email: string;
  phone: string | null;
  research_area_id: number;
  status: "Activo" | "Inactivo" | "Suspendido";
  created_at: Date;
  updated_at: Date;
}

/** Posición laboral de un miembro, con datos desnormalizados de sus lookups */
export interface DbMemberPosition {
  position_id: number;
  employer_id: number;
  employer_name: string;
  job_type_id: number;
  job_type_name: string;
  category_id: number;
  category_name: string;
  dedication_type_id: number;
  dedication_name: string;
  start_date: Date | null;
  end_date: Date | null;
  is_active: boolean;
}

/** Miembro con sus posiciones laborales activas */
export interface DbMemberWithPositions extends DbMember {
  area_name: string;
  positions: DbMemberPosition[];
}

// ─── Pool singleton ───────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function parsePort(raw: string | undefined): number {
  const port = parseInt(raw ?? "", 10);
  if (!raw || isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`DB_PORT inválido: "${raw ?? "undefined"}"`);
  }
  return port;
}

function createPool(): mysql.Pool {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
  for (const v of required) {
    if (!process.env[v]) {
      throw new Error(`Variable de entorno requerida no definida: ${v}`);
    }
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: parsePort(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Previene SQLi: una sola sentencia por llamada
    multipleStatements: false,
    connectTimeout: 10_000,
    // SSL en producción: activar con DB_SSL=true en las variables de entorno
    ...(process.env.DB_SSL === "true" && {
      ssl: { rejectUnauthorized: true },
    }),
  });
}

/** Pool compartido, singleton en desarrollo para sobrevivir hot-reloads de Next.js */
export const db: mysql.Pool =
  process.env.NODE_ENV === "development"
    ? (globalThis.__mysqlPool ??= createPool())
    : createPool();

if (process.env.NODE_ENV === "development") {
  globalThis.__mysqlPool = db;
}

// ─── Autenticación (tabla users2) ────────────────────────────────────────────

/**
 * Busca un usuario por email usando prepared statement (previene SQLi).
 * Retorna también password_hash únicamente para ser usado en el flujo de auth;
 * nunca debe exponerse en sesión o respuesta de API.
 */
export async function getUserByEmail(email: string): Promise<DbAuthUser | null> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT id, email, password_hash, name, role, is_active,
            banned_until, ban_reason, last_login
     FROM users2
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return (rows[0] as DbAuthUser) ?? null;
}

/**
 * Actualiza last_login al completarse un login exitoso.
 * Se llama sin await en el flujo de auth para no bloquear la respuesta.
 */
export async function updateLastLogin(userId: number): Promise<void> {
  await db.execute(
    `UPDATE users2 SET last_login = NOW() WHERE id = ?`,
    [userId]
  );
}

// ─── Miembros (tabla members) ─────────────────────────────────────────────────

/**
 * Obtiene los datos de un miembro por su ID.
 */
export async function getMemberById(id: number): Promise<DbMember | null> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT id, last_name, first_name, doc_type_id, doc_number, birth_date,
            nationality_id, gender_id, email, phone, research_area_id, status,
            created_at, updated_at
     FROM members
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return (rows[0] as DbMember) ?? null;
}

/**
 * Obtiene la lista de miembros activos con datos básicos para listados.
 */
export async function getActiveMembers(): Promise<
  Pick<DbMember, "id" | "last_name" | "first_name" | "email" | "phone" | "research_area_id" | "status">[]
> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT id, last_name, first_name, email, phone, research_area_id, status
     FROM members
     WHERE status = 'Activo'
     ORDER BY last_name ASC, first_name ASC`
  );
  return rows as DbMember[];
}

/**
 * Obtiene un miembro con todas sus posiciones laborales activas,
 * incluyendo los nombres desnormalizados de empleador, tipo de cargo,
 * categoría y dedicación.
 */
export async function getMemberWithPositions(
  memberId: number
): Promise<DbMemberWithPositions | null> {
  const [memberRows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT m.id, m.last_name, m.first_name, m.doc_type_id, m.doc_number,
            m.birth_date, m.nationality_id, m.gender_id, m.email, m.phone,
            m.research_area_id, m.status, m.created_at, m.updated_at,
            ra.area_name
     FROM members m
     LEFT JOIN research_areas ra ON ra.id = m.research_area_id
     WHERE m.id = ?
     LIMIT 1`,
    [memberId]
  );

  if (!memberRows[0]) return null;

  const [posRows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT mp.id         AS position_id,
            mp.employer_id, e.employer_name,
            mp.job_type_id, jt.job_type_name,
            mp.category_id, c.category_name,
            mp.dedication_type_id, dt.dedication_name,
            mp.start_date, mp.end_date,
            mp.is_active
     FROM member_positions mp
     JOIN employers       e  ON e.id  = mp.employer_id
     JOIN job_types       jt ON jt.id = mp.job_type_id
     JOIN categories      c  ON c.id  = mp.category_id
     JOIN dedication_types dt ON dt.id = mp.dedication_type_id
     WHERE mp.member_id = ?
     ORDER BY mp.is_active DESC, mp.start_date DESC`,
    [memberId]
  );

  return {
    ...(memberRows[0] as DbMember & { area_name: string }),
    positions: posRows as DbMemberPosition[],
  };
}

// ─── Sistema de baneo (tabla users2) ──────────────────────────────────────────

/**
 * Verifica si un usuario está actualmente baneado.
 * Un usuario está baneado si banned_until es una fecha futura.
 */
export function isUserBanned(user: Pick<DbAuthUser, "banned_until">): boolean {
  if (!user.banned_until) return false;
  return new Date(user.banned_until) > new Date();
}

/**
 * Banea a un usuario por una cantidad de minutos.
 * @param userId   ID del usuario en users2
 * @param minutes  Duración del baneo en minutos
 * @param reason   Motivo del baneo (auditoría)
 */
export async function banUser(
  userId: number,
  minutes: number,
  reason: string
): Promise<void> {
  await db.execute(
    `UPDATE users2
     SET banned_until = DATE_ADD(NOW(), INTERVAL ? MINUTE),
         ban_reason   = ?
     WHERE id = ?`,
    [minutes, reason, userId]
  );
}

/**
 * Banea por email (útil cuando el usuario no existe pero queremos
 * registrar el intento — en ese caso solo se registra en login_attempts).
 * Si el email corresponde a un usuario existente, se lo banea.
 */
export async function banUserByEmail(
  email: string,
  minutes: number,
  reason: string
): Promise<void> {
  await db.execute(
    `UPDATE users2
     SET banned_until = DATE_ADD(NOW(), INTERVAL ? MINUTE),
         ban_reason   = ?
     WHERE email = ?`,
    [minutes, reason, email]
  );
}

/**
 * Desbanea a un usuario inmediatamente.
 */
export async function unbanUser(userId: number): Promise<void> {
  await db.execute(
    `UPDATE users2
     SET banned_until = NULL,
         ban_reason   = NULL
     WHERE id = ?`,
    [userId]
  );
}
