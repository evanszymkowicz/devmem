import type { DefaultSession } from "next-auth";

// Extend the session so `session.user.id` is typed everywhere it's consumed.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Carry the user id on the JWT (jwt strategy) so the session callback can read it.
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
