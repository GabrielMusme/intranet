import { db } from "./db";

export async function logAuthEvent(
  eventType: "signIn" | "signOut" | "failed" | "success",
  memberId: number | string | null,
  email: string | null,
  details: Record<string, any> = {}
) {
  
  const conn = await db.getConnection();
  try {
    const insert = `
      INSERT INTO auth_log (memberId, email, eventType, details, createdAt)
      VALUES (?, ?, ?, ?, NOW())
    `;

    // Serializar detalles de forma segura (MariaDB no siempre soporta JSON nativo)
    let detailsStr: string;
    try {
      detailsStr = JSON.stringify(details);
    } catch (err) {
      detailsStr = String(details ?? "");
    }

    // Limitar tamaño para evitar columnas excesivamente grandes en casos inesperados
    const MAX_LENGTH = 1024 * 1024; // 1MB
    if (detailsStr.length > MAX_LENGTH) {
      detailsStr = detailsStr.slice(0, MAX_LENGTH) + "... [truncated]";
    }

    await conn.execute(insert, [memberId ?? null, email ?? null, eventType, detailsStr]);
  } catch (err) {
    console.error("No fue posible guardar auth log:", err);
  } finally {
    conn.release();
  }
}
