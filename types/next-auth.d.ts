import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    statusId?: number;
    role?: string[];
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      statusId?: number;
      role?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    statusId?: number;
    role?: string[];
  }
}
