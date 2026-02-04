import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LOGIN_DEFAULT_REDIRECT } from "@/lib/constants";
import LoginForm from "./_form2";
import LandingForm from "@/components/ui/custom/landing-form";


export default async function LoginPage() {
  // Redirige si ya está autenticado
  const session = await auth();
  console.log("Session in login page: ", session);
  if (session) {
    redirect(LOGIN_DEFAULT_REDIRECT);
  }
  return (
    <LandingForm title="Inicie sesión">
      <LoginForm />
    </LandingForm>
  );
}
