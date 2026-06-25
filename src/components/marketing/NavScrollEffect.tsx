"use client";

import { useEffect } from "react";

export function NavScrollEffect({ navId }: { navId: string }) {
  useEffect(() => {
    const nav = document.getElementById(navId);
    if (!nav) return;

    function onScroll() {
      nav!.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [navId]);

  return null;
}
