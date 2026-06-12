import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { EmailUnverifiedError } from "@/lib/auth/errors";
import { signInSchema } from "@/lib/validations/auth";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/config/features";
import authConfig from "@/auth.config";

// Full config: the Prisma adapter is not edge-compatible, so it lives here and
// is kept out of `auth.config.ts`. We force the JWT session strategy because the
// proxy runs on the edge and can't reach the database for session lookups.
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Declare the providers fully here, replacing the edge-safe placeholders from
  // `auth.config.ts`. GitHub behaves identically (it reads AUTH_GITHUB_* from the
  // env); Credentials gets the real bcrypt + Prisma validation, which can't run
  // in the edge runtime. We re-list rather than mutate `authConfig.providers`
  // because bare provider references aren't typed with a filterable `id`.
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          // Emails are stored lowercased at registration; match that here.
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });
          // Reject if no user, or if the account has no password (OAuth-only).
          if (!user?.password) return null;

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) return null;

          // Password is correct, but block sign-in until the email is verified.
          // Throwing a distinct error lets the client show a "verify / resend"
          // message instead of the generic invalid-credentials one. GitHub OAuth
          // users are unaffected — they never hit this Credentials path. Skipped
          // entirely when verification is disabled, so unverified accounts can
          // sign in while there's no verified Resend domain.
          if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) {
            throw new EmailUnverifiedError();
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          if (error instanceof ZodError) return null;
          throw error;
        }
      },
    }),
  ],
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
});
