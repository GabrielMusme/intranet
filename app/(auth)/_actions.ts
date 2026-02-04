"use server";

import bcryptjs from "bcryptjs";
import { auth, signIn } from "@/auth";
import dbPool, { ResultSetHeader } from "@/lib/db";
import { ActionStatus } from "@/lib/types";
import { MEMBER_STATUS_ACTIVE } from "@/lib/constants";
import {
  SignupSchema,
  SignupState,
  DbUser,
  AuthUser,
  RoleResult,
  LoginState,
} from "@/schemas/auth.schemas";
import { checkExistCmp } from "@/lib/intema.actions";

export async function loginAction(
  _state: any,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
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
  } catch (error: any) {
    console.log("Error en server action: ", error);
    switch (error.type) {
      case "CredentialsSignin":
        return {
          status: ActionStatus.ERROR,
          error: { general: "Usuario o contraseña NO validas" },
          values: { email, password },
        };
      case "AuthError":
        return {
          status: ActionStatus.VALIDATION_ERROR,
          error: error.validation,
          values: { email, password },
        };
      default:
        return {
          status: ActionStatus.ERROR,
          error: { general: "Error inesperado" },
          values: { email, password },
        };
    }
  }
}

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
    validationResult.error.errors.forEach((err) => {
      errorObj[err.path[0]] = err.message;
    });
    return {
      status: ActionStatus.VALIDATION_ERROR,
      error: errorObj,
      values,
    };
  }

  const intemaPool = dbPool("intraIntema");
  const conn = await intemaPool.getConnection();

  try {
    const existEmail = await checkExistCmp(
      "member",
      "email",
      `'${validationResult.data.email}'`
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
      INSERT INTO member
      (lastName, firstName, email, password, groupId, stateId)
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

export async function authenticateMember(
  email: string,
  password: string
): Promise<AuthUser | null> {
  // Aseguramos que esta acción se ejecute en el entorno Node.js completo
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("This action must be executed in a Node.js environment");
  }

  const intemaPool = dbPool("intraIntema");
  const connection = await intemaPool.getConnection();

  try {
    const [memberRows] = (await connection.execute(
      "SELECT id, lastName, firstName, email, password, stateId  FROM member WHERE email = ?",
      [email]
    )) as [DbUser[], any];

    if (Array.isArray(memberRows) && memberRows.length > 0) {
      const member: DbUser = memberRows[0];
      if (member.stateId !== MEMBER_STATUS_ACTIVE) {
        console.log("Usuario no activo:", member);
        return null;
      }
      const passwordMatch = await bcryptjs.compare(password, member.password);
      if (!passwordMatch) {
        return null;
      }

      const [rows] = (await connection.execute(
        "SELECT member_role.memberId, role.name FROM member_role LEFT JOIN role ON member_role.roleId = role.id WHERE member_role.memberId = ?",
        [member.id]
      )) as [RoleResult[], any];
      const roles: RoleResult[] = rows;

      const userData: AuthUser = {
        id: member.id,
        lastName: member.lastName,
        firstName: member.firstName,
        email: member.email,
        stateId: member.stateId,
        role: roles.map((role) => role.name),
      };
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
    throw new Error("Error de autenticación");
  } finally {
    // await connection.end()
    connection.release();
  }
}