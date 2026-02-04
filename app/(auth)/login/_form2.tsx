"use client";

import React, { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "../_actions";
import { LOGIN_DEFAULT_REDIRECT } from "@/lib/constants";
import { ActionStatus } from "@/lib/types";
import { LoginState } from "@/schemas/auth.schemas";
// import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import Link from "next/link";
import { AuthInput } from "@/components/ui/custom/authInput";

const initialState: LoginState = {
  status: ActionStatus.IDLE,
  values: {
    email: "",
    password: "",
  },
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  // const { toast } = useToast();

  useEffect(() => {
    if (state.status === ActionStatus.SUCCESS) {
      const href = callbackUrl || LOGIN_DEFAULT_REDIRECT;
      console.log("redirecting to: ", href);
      router.push(href);
    }
    console.log("Estado en useEfect de formulario login: ", state);
    if (state.status === ActionStatus.ERROR) {
      toast.error("No fue posible validar tus credenciales.", {
        description: "Por favor verifica tu email y contraseña",
      });
    }
  }, [state, router]);

  return (
    <>
      {/* { state.status === ActionStatus.ERROR && state.error?.general && (<p className="text-red-500 text-sm">{state.error.general}</p>)} */}
      <form
        action={formAction}
        className="mt-6 flex flex-col"
        autoComplete="off"
      >
        <AuthInput
          type="email"
          id="email"
          name="email"
          defaultValue={state.values?.email}
          errorMessage={
            state.status === ActionStatus.VALIDATION_ERROR && state.error?.email
              ? state.error.email[0]
              : ""
          }
        />

        <AuthInput
          type="password"
          id="password"
          name="password"
          defaultValue={state.values?.password}
          placeholder="Contraseña"
          errorMessage={
            state.status === ActionStatus.VALIDATION_ERROR &&
            state.error?.password
              ? state.error.password[0]
              : ""
          }
        />

        {/* {state.status === ActionStatus.ERROR && <p>{state.error.general}</p>}
      {state.status === ActionStatus.SERVER_ERROR && <p>{state.error.general}</p>} */}

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
            value={pending ? "Ingresando ..." : "Ingresar"}
            disabled={pending}
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
