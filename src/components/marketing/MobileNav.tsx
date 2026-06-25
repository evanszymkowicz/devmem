"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-[#232838] bg-[rgba(10,12,18,0.97)] px-6 py-4 backdrop-blur-sm">
          <nav className="flex flex-col gap-3">
            <Link
              href="#features"
              onClick={() => setOpen(false)}
              className="text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              onClick={() => setOpen(false)}
              className="text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
