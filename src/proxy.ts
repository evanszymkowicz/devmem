import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Lazily initialize Auth.js from the edge-compatible config only — the proxy
// runs in the edge runtime and must not pull in the Prisma adapter.
const { auth } = NextAuth(authConfig);

// Protect /dashboard/* : send unauthenticated users to our custom sign-in page
// (pages.signIn = "/sign-in" in auth.config.ts), preserving the intended
// destination as callbackUrl so they return after authenticating.
export const proxy = auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
