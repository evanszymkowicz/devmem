import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

// Full config: the Prisma adapter is not edge-compatible, so it lives here and
// is kept out of `auth.config.ts`. We force the JWT session strategy because the
// proxy runs on the edge and can't reach the database for session lookups.
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    // Persist the user id on the token at sign-in, then surface it on the
    // session so server components and actions can scope queries to the user.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  ...authConfig,
});
