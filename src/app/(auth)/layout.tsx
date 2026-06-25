import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      <main id="main-content" className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 pt-16 pb-12 text-foreground">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </main>
    </>
  );
}
