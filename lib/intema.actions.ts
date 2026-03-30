"use server";

// import { db } from "@/lib/db";
import { db } from "./db";
// import type { RowDataPacket } from "@/lib/db";
import type { RowDataPacket } from "./db";

export interface Grupo extends RowDataPacket {
  grupo_id: number;
  nombre: string;
}

export async function getGrupos() {
  const [grupos] = await db.execute<Grupo[]>(
    `SELECT id, area_name, deleted FROM research_areas ORDER BY name ASC`
  );
  return grupos;
}

/**
 * Allowlist de combinaciones tabla/columna permitidas en checkExistCmp.
 * NUNCA interpolar tabla o columna desde entrada de usuario.
 * Añadir nuevas entradas solo cuando sea necesario.
 */
const ALLOWED_CHECKS: Record<string, readonly string[]> = {
  member:         ["email"],               // legado – esquema antiguo intraIntema
  members:        ["email", "doc_number"], // Prueba3
  users2:         ["email"],               // Prueba3
  users:          ["email", "username"],   // Prueba3
  nationalities:  ["country_code"],        // Prueba3
  doc_types:      ["doc_code"],            // Prueba3
  research_areas: ["area_name"],           // Prueba3
};

/**
 * Verifica si un valor existe en una columna de una tabla.
 * - Tabla y columna se validan contra el allowlist (previene inyección de identificadores).
 * - El valor siempre usa prepared statement (previene SQLi).
 */
export async function checkExistCmp(
  table: string,
  column: string,
  value: string | number
): Promise<RowDataPacket[] | null> {
  const allowedColumns = ALLOWED_CHECKS[table];
  if (!allowedColumns || !allowedColumns.includes(column)) {
    throw new Error(
      `checkExistCmp: combinación no permitida → ${table}.${column}`
    );
  }

  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT 1 FROM \`${table}\` WHERE \`${column}\` = ? LIMIT 1`,
    [value]
  );
  return rows.length > 0 ? rows : null;
}
