export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 80% -10%, rgba(99,102,241,0.12), transparent 60%)," +
            "radial-gradient(50rem 35rem at 0% 10%, rgba(59,130,246,0.10), transparent 55%)",
        }}
      />
      {children}
    </>
  );
}
