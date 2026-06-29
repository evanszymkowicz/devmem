import type { DefaultSession } from "next-auth";

// Extend the session so `session.user.id` and `session.user.isPro` are typed everywhere.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}

// Carry the user id and isPro on the JWT so the session callback can read them.
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPro?: boolean;
  }
}
