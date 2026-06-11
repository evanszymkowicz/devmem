import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Lazily initialize Auth.js from the edge-compatible config only — the proxy
// runs in the edge runtime and must not pull in the Prisma adapter.
const { auth } = NextAuth(authConfig);

// Protect /dashboard/* : send unauthenticated users to NextAuth's default
// sign-in page (no custom pages.signIn, per spec).
export const proxy = auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
