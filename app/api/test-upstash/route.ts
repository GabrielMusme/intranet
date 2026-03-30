// ─── Endpoint eliminado ───────────────────────────────────────────────────────
// La integración con Upstash fue reemplazada por rate limiting en MariaDB.
// Este endpoint se mantiene como placeholder para evitar 404 en caso de
// que haya referencias externas (bookmarks, dashboards, etc.).
//
// Para verificar la conectividad de la base de datos, consultar
// directamente el estado del pool en los logs del servidor.

export async function GET() {
  return Response.json(
    {
      message: "Este endpoint fue deshabilitado. El rate limiting ahora usa MariaDB.",
      docs: "Ver lib/rateLimiter.ts y lib/db.ts",
    },
    { status: 410 } // 410 Gone
  );
}