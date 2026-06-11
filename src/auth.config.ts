import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter. This is the half of the
// split config that the proxy/middleware can safely import in the edge runtime.
// The Prisma adapter and JWT strategy live in `auth.ts` (Node runtime only).
//
// The Credentials provider here is a placeholder with `authorize: () => null`:
// it keeps the provider registered (so its sign-in form renders in the edge
// runtime) while the real bcrypt + Prisma validation is supplied in `auth.ts`,
// which can't run on the edge.
export default {
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
