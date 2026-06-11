import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter. This is the half of the
// split config that the proxy/middleware can safely import in the edge runtime.
// The Prisma adapter and JWT strategy live in `auth.ts` (Node runtime only).
export default {
  providers: [GitHub],
} satisfies NextAuthConfig;
