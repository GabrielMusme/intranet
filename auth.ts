import NextAuth from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthConfig";

export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthOptions);