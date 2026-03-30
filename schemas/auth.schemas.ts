import { z } from "zod";
import { ActionStatus } from "@/lib/types";

// Definiciones utilizadas en Login
// export const loginSchema = z.object({
//   email: z
//     // .string({
//     //   message: "Name must be a string",
//     // })
//     // .trim()
//     // .min(1, "El email es obligatorio")
//     .email("Formato de email inválido"),
//   password: z
//     .string()
//     .trim()
//     .min(8, "El campo 'Password' debe tener al menos 8 caracteres")
//     .max(32, "Solo se aceptan password de hasta 32 caracteres"),
// });
// export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Formato de email inválido")
    .max(255, "El email no puede superar los 255 caracteres")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede superar los 32 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginState =
  | { status: ActionStatus.IDLE; values: LoginFormValues }
  | { status: ActionStatus.SUCCESS; values: LoginFormValues }
  | {
      status: ActionStatus.ERROR;
      error: { general: string };
      values: LoginFormValues;
    }
  | {
      status: ActionStatus.VALIDATION_ERROR;
      error: Record<string, string>;
      values: LoginFormValues;
    };

//Definiciones utilizadas en Signup
export const SignupSchema = z
  .object({
    lastName: z
      .string()
      .min(2, "El Apellido debe tener al menos 2 caracteres"),
    firstName: z.string().min(2, "En Nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Debe ser un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(32, "La contraseña puede contener hasta 32 caracteres")
      .regex(
        new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,20}$'),
        ' La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial'
       ),
    confirmPassword: z
      .string()
      .min(6, "La confirmación debe tener al menos 6 caracteres")
      .max(32, "La contraseña puede contener hasta 32 caracteres"),
    groupId: z.number().positive().int(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las Passwords no coinciden",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof SignupSchema>;


export type SignupState =
  | { status: ActionStatus.IDLE; values: SignupFormValues }
  | { status: ActionStatus.SUCCESS; values: SignupFormValues }
  | {
      status: ActionStatus.ERROR;
      error: { general: string };
      values: SignupFormValues;
    }
  | {
      status: ActionStatus.VALIDATION_ERROR;
      error: Record<string, string>;
      values: SignupFormValues;
    };

// **********************

export type DbUser = {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  stateId: number;
};

export type AuthUser = Omit<DbUser, "password"> & { role?: string[] };

export type RoleResult = { memberId: number; name: string };