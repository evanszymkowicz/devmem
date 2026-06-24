import Link from "next/link";
import { auth } from "@/auth";
import { NavScrollEffect } from "./NavScrollEffect";

export async function MarketingNav() {
  const session = await auth();
  const isAuthed = !!session?.user;

  return (
    <>
      <NavScrollEffect navId="marketing-nav" />
      <nav
        id="marketing-nav"
        className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-transparent bg-[rgba(10,12,18,0.35)] backdrop-blur-sm transition-[background,border-color] duration-300 [&.is-scrolled]:border-[#232838] [&.is-scrolled]:bg-[rgba(10,12,18,0.85)]"
      >
        <div className="mx-auto flex h-full max-w-[1180px] items-center gap-8 px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[1.12rem] font-extrabold text-foreground"
            aria-label="DevMemory home"
          >
            <span
              aria-hidden
              className="grid h-[30px] w-[30px] place-items-center rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[17px] w-[17px]"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span>DevMemory</span>
          </Link>

          <div className="ml-2 hidden items-center gap-6 sm:flex">
            <Link
              href="#features"
              className="text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#232838] bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-[#232838] bg-white/[0.03] px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.07]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_8px_26px_rgba(99,102,241,0.45)]"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
