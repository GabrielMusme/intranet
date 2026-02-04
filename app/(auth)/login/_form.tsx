"use client";

import React, { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "../_actions";
import { ActionStatus } from "@/lib/types";
import { LOGIN_DEFAULT_REDIRECT } from "@/lib/constants";
import { LoginState } from "@/schemas/auth.schemas";

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



  const [state, formAction, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.status === ActionStatus.SUCCESS) {
      const href = callbackUrl || LOGIN_DEFAULT_REDIRECT;
      router.push(href);
    }
  }, [state]);

  return (
    <>
      {/* {state?.error?.general} */}
      { state.status === ActionStatus.ERROR && state.error?.general && (<p className="text-red-500 text-sm">{state.error.general}</p>)}
      <form action={formAction}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={state.values.email}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
          {/* {state?.error?.email && (
            <p className="text-red-500">{state.error.email[0]}</p>
          )} */}
          { state.status === ActionStatus.VALIDATION_ERROR && state.error?.email && (<p className="text-red-500 text-sm">{state.error.email}</p>)}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            defaultValue={state.values?.password}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
          {/* {state?.error?.password && <p>{state.error.password[0]}</p>} */}
          { state.status === ActionStatus.VALIDATION_ERROR && state.error?.password && (<p className="text-red-500 text-sm">{state.error.password}</p>)}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </button>
      </form>
    </>
  );
}