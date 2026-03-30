"use server";

import bcryptjs from "bcryptjs";
import { z } from "zod";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import type { ResultSetHeader } from "@/lib/db";
import { ActionStatus } from "@/lib/types";
import { MEMBER_STATUS_ACTIVE } from "@/lib/constants";
import {
  SignupSchema,
  SignupState,
  DbUser,
  AuthUser,
  RoleResult,
  LoginState,
  LoginFormValues,
  loginSchema,
} from "@/schemas/auth.schemas";
import { checkExistCmp } from "@/lib/intema.actions";

// export async function loginAction(
//   _state: any,
//   formData: FormData
// ): Promise<LoginState> {
//   const formEmail = formData.get("email") as string;
//   const formPassword = formData.get("password") as string;
//   const { success, data, error } = loginSchema.safeParse({ formEmail, formPassword });
//   if (!success) {
//     console.log("Error de validacion: ", error.flatten().fieldErrors);
//     return {
//       status: ActionStatus.VALIDATION_ERROR,
//       error: error.flatten().fieldErrors,
//       values: { email: formEmail, password: formPassword },
//     }
//     // throw new LoginValidationError(
//     //   "Validation error",
//     //   error.flatten().fieldErrors
//     // );
//   }
//   const { email, password } = data;
//   console.log("Validando credenciales para:", email);
  
//   try {
//     await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });
//     return {
//       status: ActionStatus.SUCCESS,
//       values: { email, password },
//     };
//   } catch (error: any) {
//     console.log("Error en server action: ", error);
//     switch (error.type) {
//       case "CredentialsSignin":
//         return {
//           status: ActionStatus.ERROR,
//           error: { general: "Usuario o contraseña NO validas" },
//           values: { email, password },
//         };
//       case "AuthError":
//         return {
//           status: ActionStatus.VALIDATION_ERROR,
//           error: error.validation,
//           values: { email, password },
//         };
//       default:
//         return {
//           status: ActionStatus.ERROR,
//           error: { general: "Error inesperado" },
//           values: { email, password },
//         };
//     }
//   }
// }
export async function loginAction(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const values: LoginFormValues = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    // password: String(formData.get("password")?.slice(0, 5) ?? ""),
  };

  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: ActionStatus.VALIDATION_ERROR,
      error: {
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      },
      values,
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      status: ActionStatus.SUCCESS,
      values: { email, password },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return {
            status: ActionStatus.ERROR,
            error: {
              general: "Credenciales incorrectas. Verifica tu email y contraseña.",
            },
            values: { email, password },
          };
        default:
          return {
            status: ActionStatus.ERROR,
            error: {
              general: "Ocurrió un error inesperado. Intenta de nuevo.",
            },
            values: { email, password },
          };
      }
    }

    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("[loginAction] Error inesperado:", error);
    return {
      status: ActionStatus.ERROR,
      error: {
        general: "Error interno del servidor. Intenta de nuevo más tarde.",
      },
      values: { email, password },
    };
  }
}


//Revisar lógicamente el flujo de esta función, ya que hace referencia a tablas del esquema antiguo (intraIntema) y no al nuevo esquema de Prueba3. Migrar a las tablas equivalentes de Prueba3 cuando estén definidas.
export async function signupAction(
  _state: any,
  formData: FormData
): Promise<SignupState> {
  // console.log("signupAction", formData);

  const session = await auth()

  const values = {
    lastName: formData.get("lastName") as string,
    firstName: formData.get("firstName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    groupId: Number(formData.get("groupId")),
  };

  // Validar los datos con Zod
  const validationResult = SignupSchema.safeParse(values);

  if (!validationResult.success) {
    // Transformar los errores de Zod en un objeto clave-valor
    const errorObj: Record<string, string> = {};
    const zErrors = (validationResult.error as any).errors as Array<any>;
    zErrors.forEach((err) => {
      errorObj[err.path[0]] = err.message;
    });
    return {
      status: ActionStatus.VALIDATION_ERROR,
      error: errorObj,
      values,
    };
  }

  // TODO: signupAction referencia tablas del esquema antiguo (intraIntema).
  //       Migrar INSERT a la tabla members/users2 de Prueba3.
  const conn = await db.getConnection();

  try {
    const existEmail = await checkExistCmp(
      "member",
      "email",
      validationResult.data.email
    );
    if (existEmail) {
      console.log("Email duplicado !!!");
      return {
        status: ActionStatus.ERROR,
        error: { general: "El email ya se encuentra registrado" },
        values,
      };
    }

    const insertMember = `
      INSERT INTO members
      (last_name, first_name, email, password, groupId, stateId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const { password, confirmPassword, ...frmDataVal } = validationResult.data;
    const passHashed = await bcryptjs.hash(validationResult.data.password, 10);
    const arg = [
      frmDataVal.lastName,
      frmDataVal.firstName,
      frmDataVal.email,
      passHashed,
      frmDataVal.groupId,
      2,
    ]; // El estado debería ser 1, pero como no se desarrolló la funcionalidad para que el coordinador de área valide la solicitud, se valida por default (2).

    // console.log("Argumentos SQL: ", arg)

    // Guardo el nuevo usuario en la DB
    const [result] = await conn.execute<ResultSetHeader>(insertMember, arg);
    if (result.affectedRows === 1) {

      const memberID = result.insertId;
      
      //Establezco el rol del usuario a USER por defecto
      const insertRole = `
        INSERT INTO member_role
        (memberId, roleId)
        VALUES (?, ?)
        `
      const [memberRoleResult] = await conn.execute<ResultSetHeader>(insertRole, [memberID, 1])
      if (memberRoleResult.affectedRows === 0) {
        console.log(`No fue posible generar el rol por defecto del usuario: ${frmDataVal.lastName} ${frmDataVal.firstName}`)
      }

      //Genero el log de creación de usuario
      const insertMemberLog = `
      INSERT INTO member_log
      (memberId, description, modifiedBy)
      VALUES (?, ?, ?)
      `;
      const description =  `Alta de usuario: ${frmDataVal.lastName} ${frmDataVal.firstName}`
      const modifiedBy = session?.user.id || ""

      const [logResult] = await conn.execute<ResultSetHeader>(insertMemberLog, [memberID, description, modifiedBy])

      if (logResult.affectedRows === 0) {
        console.error(`No fue posible guardar el LOG de creación de usuario de: ${frmDataVal.lastName} ${frmDataVal.firstName}`)
      }
      // console.log("Resultado de insert member: ", result)
      return {
        status: ActionStatus.SUCCESS,
        values,
      };
    } else {
      return {
        status: ActionStatus.ERROR,
        error: {
          general:
            "No fue posible dar de alta. Por favor intente nuevamente en unos instantes",
        },
        values,
      };
    }
  } catch (error) {
    console.log("ERROR signupAction: ", error);
    return {
      status: ActionStatus.ERROR,
      error: { general: "Error inesperado, intenta de nuevo" },
      values,
    };
  } finally {
    conn.release()
  }
}

import { isAllowedLogin, incrFailedLogin, resetFailedLogin } from "@/lib/rateLimiter";
import { logAuthEvent } from "@/lib/authAudit";
// import { LoginValidationError } from "@/lib/nextAuthConfig";

// export async function authenticateMember(
//   email: string,
//   password: string
// ): Promise<AuthUser | null> {
//   // Aseguramos que esta acción se ejecute en el entorno Node.js completo
//   if (process.env.NEXT_RUNTIME === "edge") {
//     throw new Error("This action must be executed in a Node.js environment");
//   }

//   // TODO: authenticateMember es legacy (intraIntema). El flujo activo usa getUserByEmail en nextAuthConfig.ts.
//   const connection = await db.getConnection();

//   try {
//     // Rate limit: verificar con Upstash @upstash/ratelimit si está disponible
//     const MAX_ATTEMPTS = 5;
//     const WINDOW_SECONDS = 5 * 60; // 5 minutos
//     const allowed = await isAllowedLogin(email, MAX_ATTEMPTS, WINDOW_SECONDS);
//     if (!allowed.allowed) {
//       console.warn(`Bloqueado por demasiados intentos (ratelimit): ${email}`);
//       await logAuthEvent("failed", null, email, { reason: "blocked_too_many_attempts", attempts: allowed.limit - (allowed.remaining ?? 0) });
//       return null;
//     }

//     const [memberRows] = (await connection.execute(
//       "SELECT id, lastName, firstName, email, password, stateId  FROM member WHERE email = ?",
//       [email]
//     )) as [DbUser[], any];

//     if (Array.isArray(memberRows) && memberRows.length > 0) {
//       const member: DbUser = memberRows[0];
//       if (member.stateId !== MEMBER_STATUS_ACTIVE) {
//         console.log("Usuario no activo:", member);
//         await logAuthEvent("failed", member.id, email, { reason: "not_active" });
//         return null;
//       }
//       const passwordMatch = await bcryptjs.compare(password, member.password);
//       if (!passwordMatch) {
//         // incrementar contador de intentos fallidos
//         const count = await incrFailedLogin(email, WINDOW_SECONDS);
//         console.log(`Intento fallido ${count} para ${email}`);
//         await logAuthEvent("failed", member.id, email, { reason: "invalid_password", attempts: count });
//         return null;
//       }

//       // autenticación correcta: resetear contador y log
//       await resetFailedLogin(email);

//       const [rows] = (await connection.execute(
//         "SELECT member_role.memberId, role.name FROM member_role LEFT JOIN role ON member_role.roleId = role.id WHERE member_role.memberId = ?",
//         [member.id]
//       )) as [RoleResult[], any];
//       const roles: RoleResult[] = rows;

//       const userData: AuthUser = {
//         id: member.id,
//         lastName: member.lastName,
//         firstName: member.firstName,
//         email: member.email,
//         stateId: member.stateId,
//         role: roles.map((role) => role.name),
//       };

//       await logAuthEvent("success", member.id, email, { reason: "authenticated" });
//       return userData;
//     } else {
//       // usuario no encontrado: incrementar contador también para evitar enumeración
//       const count = await incrFailedLogin(email, WINDOW_SECONDS);
//       await logAuthEvent("failed", null, email, { reason: "not_found", attempts: count });
//       return null;
//     }
//   } catch (error) {
//     console.error("Error de autenticación:", error);
//     throw new Error("Error de autenticación");
//   } finally {
//     // await connection.end()
//     connection.release();
//   }
// }