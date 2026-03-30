"use client";

import { loginAction } from "../_actions";
import { LOGIN_DEFAULT_REDIRECT } from "@/lib/constants";

import Link from "next/link";
import { AuthInput } from "@/components/ui/custom/authInput";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { loginSchema, type LoginFormValues } from "@/schemas/auth.schemas";


export default function LoginForm() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isPending, startTransition] = useTransition();
  // const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched", // Validar al salir del campo
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);

      const result = await loginAction(
        {
          status:  "IDLE" as never,
          values,
        },
        formData
      );

      if (result.status === "SUCCESS") {
        toast.success("¡Bienvenido!", {
          description: "Sesión iniciada correctamente.",
        });
        router.push(callbackUrl || LOGIN_DEFAULT_REDIRECT);
        router.refresh();
      } else if (result.status === "VALIDATION_ERROR") {
        Object.entries(result.error).forEach(([field, message]) => {
          if (!message) return;
          setError(field as keyof LoginFormValues, {
            type: "server",
            message,
          });
        });

        console.log("[LoginForm] Errores de validación del servidor:", errors);
        toast.error("Error de validación", {
          description: "Por favor corrige los errores en el formulario.",
        });
      } else if (result.status === "ERROR") {
        toast.error("Error de autenticación", {
          description: result.error.general,
        });
      } else {
        toast.error("Error de autenticación", {
          description: "No fue posible iniciar sesión.",
        });
      }
    });
  };

  return (
    <>
      {/* { state.status === ActionStatus.ERROR && state.error?.general && (<p className="text-red-500 text-sm">{state.error.general}</p>)} */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col"
        noValidate
        aria-label="Formulario de inicio de sesión"
      >
        <AuthInput
          type="email"
          id="email"
          {...register("email")}
          errorMessage={errors.email?.message}
        />

        <AuthInput
          type="password"
          id="password"
          placeholder="Contraseña"
          {...register("password")}
          errorMessage={errors.password?.message}
        />

        <div className="mb-2 relative">
          <input
            className="w-full outline-none py-2 px-4 text-xl text-center bg-gradient-to-tl from-[#7cadb3] to-[#275273] hover:from-[#275273] hover:to-[#7cadb3]"
            type="submit"
            style={{
              border: "1px solid #242c37",
              font: "inherit",
              borderRadius: "999px",
              color: "#fff",
            }}
            value={isPending ? "Ingresando ..." : "Ingresar"}
            disabled={isPending}
          />
        </div>
        <RegisterLink />
      </form>
    </>
  );
}

export function RegisterLink() {
  return (
    <div className="flex justify-center mt-4">
      <p>
        <strong>No tiene cuenta? </strong>{" "}
        <Link className="text-gray-600 font-bold" href="/signup">
          Regístrese
        </Link>
      </p>
    </div>
  );
}
