export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <div className="h-9 w-40 rounded-md bg-muted animate-pulse" />
        <div className="mt-1 h-4 w-56 rounded bg-muted animate-pulse" />
      </header>

      <div className="flex flex-col gap-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-8 w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* Collections grid */}
        <section>
          <div className="mb-4 h-6 w-28 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border-l-4 border bg-card p-4 space-y-2" style={{ borderLeftColor: "#6b7280" }}>
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Item rows */}
        <section>
          <div className="mb-4 h-6 w-20 rounded bg-muted animate-pulse" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-3 flex items-start gap-3">
                <div className="size-7 rounded-md bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-3 w-10 rounded bg-muted animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
