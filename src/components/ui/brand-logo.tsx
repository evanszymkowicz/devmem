interface BrandLogoProps {
  size?: "sm" | "md";
}

// size sm = sidebar (28px container, rounded-md, 15px icon)
// size md = marketing nav (30px container, rounded-lg, 17px icon)
export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const isSm = size === "sm";
  return (
    <span
      aria-hidden="true"
      className={
        isSm
          ? "grid size-7 place-items-center rounded-md text-white"
          : "grid h-[30px] w-[30px] place-items-center rounded-lg text-white"
      }
      style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isSm ? "h-[15px] w-[15px]" : "h-[17px] w-[17px]"}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </span>
  );
}
