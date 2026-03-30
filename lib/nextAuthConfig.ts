import type { NextAuthConfig } from "next-auth";
import { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema, AuthUser } from "@/schemas/auth.schemas";
// import { authenticateMember } from "@/app/(auth)/_actions";
import { getUserByEmail, updateLastLogin, isUserBanned, banUserByEmail } from "./db";
import { isAllowedLogin, incrFailedLogin, resetFailedLogin, recordLoginAttempt } from "./rateLimiter";
import bcrypt from "bcryptjs";


export class LoginValidationError extends AuthError {
  my_message = "";
  validation: any;
  constructor(message: string, valErr: any) {
    super(message);
    this.my_message = message;
    this.validation = valErr;
  }
}

function getDisplayName(user: {
  name?: string | null;
  firstName?: string;
  lastName?: string;
}): string {
  if (user.name) return user.name;

  const fullName = [user.lastName, user.firstName].filter(Boolean).join(" ").trim();
  return fullName || "";
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for puede traer una lista de IPs separadas por coma.
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return null;
}

export const nextAuthOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60, // 1 hour
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // authorize: async (credentials): Promise<AuthUser | null> => {
      //   const { success, data, error } = loginSchema.safeParse(credentials);

      //   if (!success) {
      //     console.log("Error de validacion: ", error.flatten().fieldErrors);
      //     throw new LoginValidationError(
      //       "Validation error",
      //       error.flatten().fieldErrors
      //     );
      //   }
      //   const { email, password } = data;
      //   console.log("Validando credenciales para:", email);

      //   const user = await authenticateMember(email, password);
      //   // const { email, password } = credentials ?? {};
      //   // const user = await authenticateMember(email, password);
      //   console.log("Credenciales validadas:", user ? { id: user.id, email: user.email } : null);
      //   return user;
      // },
      async authorize(credentials, request) {
        // Validación de datos con Zod en el provider
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const clientIp = getClientIp(request);

        try {
          // ── Rate Limiting ──────────────────────────────────────────────
          const rateCheck = await isAllowedLogin(email, 5, 300, clientIp);
          if (!rateCheck.allowed) {
            // Baneo automático por exceso de intentos (30 minutos)
            await banUserByEmail(email, 30, "Baneo automático: demasiados intentos fallidos");
            return null;
          }

          // Consulta a MariaDB usando prepared statement (ver lib/db.ts)
          const user = await getUserByEmail(email);

          // Si no existe el usuario o está inactivo, retornamos null
          // (respuesta genérica para evitar user enumeration)
          if (!user || !user.is_active) {
            await incrFailedLogin(email, 300, clientIp);
            return null;
          }

          // ── Verificación de baneo ──────────────────────────────────────
          if (isUserBanned(user)) {
            return null;
          }

          // Comparación segura de contraseña con bcrypt
          const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
          );

          if (!passwordMatch) {
            await incrFailedLogin(email, 300, clientIp);
            return null;
          }

          // Login exitoso: registrar intento y limpiar fallidos
          recordLoginAttempt(email, true, clientIp).catch(() => {});
          resetFailedLogin(email).catch(() => {});

          // Actualizar last_login sin bloquear el flujo
          updateLastLogin(user.id).catch((err) =>
            console.error("[auth] Error actualizando last_login:", err)
          );

          // Retornar objeto de usuario para la sesión (sin datos sensibles)
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: [user.role],
          };
        } catch (error) {
          console.error("[auth] Error en authorize:", error);
          // No propagamos el error para evitar revelar detalles internos
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & Partial<AuthUser>;
        token.id = u.id;
        token.name = getDisplayName(u);
        token.statusId = u.statusId ?? u.stateId;
        token.role = Array.isArray(u.role) ? u.role : [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.statusId = token.statusId as number;
        session.user.role = (token.role as string[]) ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    signIn: async ({ user, account }) => {
      // Guardar auditoría de login
      try {
        const memberId = (user as any)?.id ?? null;
        const email = (user as any)?.email ?? null;
        await (await import("@/lib/authAudit")).logAuthEvent("signIn", memberId, email, { provider: account?.provider });
      } catch (err) {
        console.error("Error al guardar auditoría signIn:", err);
      }
    },
    signOut: async (payload: any) => {
      try {
        const token = payload?.token ?? payload;
        await (await import("@/lib/authAudit")).logAuthEvent("signOut", token?.sub ?? null, token?.email ?? null, {});
      } catch (err) {
        console.error("Error al guardar auditoría signOut:", err);
      }
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
