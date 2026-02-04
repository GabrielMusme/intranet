import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthUser, loginSchema } from "@/schemas/auth.schemas";
import { authenticateMember } from "./_actions";

export class LoginValidationError extends AuthError {
  my_message = "";
  validation: any;
  constructor(message: string, valErr: any) {
    super(message);
    this.my_message = message;
    this.validation = valErr;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 1 * 1 * 60,
    updateAge: 1 * 1 * 30,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<AuthUser | null> => {
        const { success, data, error } = loginSchema.safeParse(credentials);

        if (!success) {
          console.log("Error de validacion: ", error.flatten().fieldErrors);
          throw new LoginValidationError(
            "Validation error",
            error.flatten().fieldErrors
          );
        }
        const { email, password } = data;

        // const user = await authenticateMember(email, password) as User;
        const user = await authenticateMember(email, password);
        console.log("Credenciales validadas");
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name= user.lastName + " " + user.firstName
        token.statusId = user.statusId
        token.role = user.role ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.statusId= token.statusId as number
        session.user.role = (token.role as string[]) ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
