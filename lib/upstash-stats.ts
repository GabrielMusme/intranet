// ─── Módulo eliminado ─────────────────────────────────────────────────────────
// Las estadísticas de Upstash ya no son necesarias.
// El rate limiting y baneo ahora se gestionan en MariaDB.
// Ver: lib/rateLimiter.ts y lib/db.ts (funciones ban*)
//
// Si necesitas estadísticas de uso de la base de datos, consulta
// directamente MariaDB con SHOW TABLE STATUS o INFORMATION_SCHEMA.

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-AR").format(num);
}