import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroChaos } from "@/components/marketing/HeroChaos";
import { PricingToggle } from "@/components/marketing/PricingToggle";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export const metadata = {
  title: "DevMemory — Your developer knowledge hub",
  description:
    "One fast, searchable, AI-enhanced hub for every developer's snippets, prompts, commands, notes, files, and links.",
};

export default function HomePage() {
  return (
    <>
      <MarketingNav />

      {/* ====== HERO ====== */}
      <header className="mx-auto max-w-[1180px] px-6 pb-18 pt-[calc(4rem+64px)] text-center">
        <ScrollReveal>
          <span className="mb-5 inline-block rounded-full border border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.10)] px-[13px] py-[5px] text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#6366f1]">
            Your developer knowledge hub
          </span>
          <h1 className="mx-auto mb-5 max-w-[16ch] text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.08] tracking-tight">
            Store your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #3b82f6, #ec4899 55%, #8b5cf6)",
              }}
            >
              Developer Knowledge
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-[60ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
            Snippets, prompts, commands, notes, files, and links centralized.
            DevMemory pulls them into one fast, searchable, AI-enhanced hub.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/register"
              className="inline-flex items-center rounded-[9px] px-[26px] py-[13px] text-[1rem] font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_8px_26px_rgba(99,102,241,0.45)]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >
              Get Started for Free
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-[9px] border border-[#232838] bg-white/[0.03] px-[26px] py-[13px] text-[1rem] font-semibold text-foreground transition-colors hover:bg-white/[0.07]"
            >
              See Features
            </Link>
          </div>
        </ScrollReveal>

        {/* Chaos → Order visual */}
        <ScrollReveal className="mt-18">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            {/* Chaos panel */}
            <section
              className="rounded-[14px] border border-[#232838] bg-[#11141d] p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]"
              aria-label="Knowledge scattered across many apps"
            >
              <span className="mb-3 block text-left text-[0.82rem] font-semibold text-[#6b7384]">
                Your knowledge today...
              </span>
              <HeroChaos />
            </section>

            {/* Arrow */}
            <div
              aria-hidden
              className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_8px_24px_rgba(99,102,241,0.45)] md:rotate-0 rotate-90 animate-[pulse-arrow_1.8s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[26px] w-[26px]"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Dashboard preview */}
            <section
              className="rounded-[14px] border border-[#232838] bg-[#11141d] p-4"
              aria-label="Organized with DevMemory"
            >
              <span className="mb-3 block text-left text-[0.82rem] font-semibold text-[#6b7384]">
                ...with DevMemory
              </span>
              <div className="grid h-[340px] grid-cols-[96px_1fr] gap-3 rounded-[9px] border border-[#232838] bg-[#0a0c12] p-3">
                {/* Sidebar */}
                <div className="flex flex-col gap-2.5">
                  <div
                    className="mb-1 h-[18px] rounded-[5px]"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                  />
                  {(
                    [
                      ["#3b82f6", "Snippets"],
                      ["#8b5cf6", "Prompts"],
                      ["#f97316", "Commands"],
                      ["#fde047", "Notes"],
                      ["#6b7280", "Files"],
                      ["#ec4899", "Images"],
                      ["#10b981", "Links"],
                    ] as [string, string][]
                  ).map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      {label}
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div className="grid grid-cols-2 gap-2 content-start">
                  <span className="col-span-2 text-[0.54rem] font-bold uppercase tracking-[0.07em] text-[#6b7384]">
                    Collections
                  </span>
                  {(["#3b82f6", "#8b5cf6", "#f97316", "#fde047"] as string[]).map((accent) => (
                    <div
                      key={accent}
                      className="h-[52px] rounded-lg border border-[#232838] bg-[#161a25] p-2"
                      style={{ borderTop: `3px solid ${accent}` }}
                    >
                      <div className="mb-1 h-[5px] rounded bg-[#6b7384] opacity-25" />
                      <div className="h-[5px] w-[60%] rounded bg-[#6b7384] opacity-25" />
                    </div>
                  ))}
                  <span className="col-span-2 mt-1 text-[0.54rem] font-bold uppercase tracking-[0.07em] text-[#6b7384]">
                    Recent Items
                  </span>
                  {(["#ec4899", "#10b981"] as string[]).map((accent) => (
                    <div
                      key={accent}
                      className="h-[52px] rounded-lg border border-[#232838] bg-[#161a25] p-2"
                      style={{ borderTop: `3px solid ${accent}` }}
                    >
                      <div className="mb-1 h-[5px] rounded bg-[#6b7384] opacity-25" />
                      <div className="h-[5px] w-[60%] rounded bg-[#6b7384] opacity-25" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </ScrollReveal>
      </header>

      {/* ====== FEATURES ====== */}
      <div className="border-y border-[#232838] bg-[#11141d]">
        <section className="mx-auto max-w-[1180px] px-6 py-22" id="features">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-[clamp(1.7rem,3.5vw,2.6rem)] font-extrabold tracking-tight">
                Everything in One Place
              </h2>
              <p className="mt-3 text-[1.05rem] text-muted-foreground">
                Capture any kind of developer knowledge and find it again in seconds.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <ScrollReveal key={f.title}>
                <article
                  className="group rounded-[14px] border border-[#232838] bg-[#11141d] p-[26px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.4)]"
                  style={
                    { "--accent": f.color } as React.CSSProperties
                  }
                >
                  <div
                    className="mb-4 grid h-[46px] w-[46px] place-items-center rounded-[11px] border"
                    style={{
                      color: f.color,
                      background: `color-mix(in srgb, ${f.color} 14%, transparent)`,
                      borderColor: `color-mix(in srgb, ${f.color} 30%, transparent)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: f.icon }}
                  />
                  <h3 className="mb-1.5 text-[1.12rem] font-semibold">{f.title}</h3>
                  <p className="text-[0.95rem] text-muted-foreground">{f.desc}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>

      {/* ====== AI SECTION ====== */}
      <section className="mx-auto max-w-[1180px] px-6 py-22">
        <div className="grid min-w-0 items-center gap-14 md:grid-cols-2">
          <ScrollReveal>
            <span className="mb-4 inline-block rounded-full border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.12)] px-3 py-1 text-[0.74rem] font-bold uppercase tracking-[0.05em] text-[#f59e0b]">
              Pro Feature
            </span>
            <h2 className="text-[clamp(1.7rem,3.5vw,2.6rem)] font-extrabold tracking-tight">
              Let AI Do the Busywork
            </h2>
            <p className="mt-3 text-[1.05rem] text-muted-foreground">
              Powered by AI, DevMemory enriches your knowledge as you save it.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                "Auto-tag suggestions for every item",
                "Instant summaries of long notes",
                '"Explain this code" in plain English',
                "One-click prompt optimizer",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[1.02rem]">
                  <span
                    className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E\") center / 13px no-repeat, linear-gradient(135deg, #22c55e, #06b6d4)",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal className="min-w-0">
            <div className="overflow-hidden rounded-[14px] border border-[#232838] bg-[#11141d] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-1.5 border-b border-[#232838] bg-[#161a25] px-4 py-3">
                <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f56]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#ffbd2e]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#27c93f]" />
                <span className="ml-2.5 font-mono text-[0.82rem] text-[#6b7384]">
                  debounce.ts
                </span>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[0.85rem] leading-[1.7] text-muted-foreground">
                <code>
                  <span className="text-[#ec4899]">export function</span>
                  {" "}
                  <span className="text-[#06b6d4]">debounce</span>
                  {"(fn, "}
                  <span className="text-[#f59e0b]">delay</span>
                  {") {\n  "}
                  <span className="text-[#ec4899]">let</span>
                  {" timer;\n  "}
                  <span className="text-[#ec4899]">return</span>
                  {" (...args) => {\n    "}
                  <span className="text-[#06b6d4]">clearTimeout</span>
                  {"(timer);\n    timer = "}
                  <span className="text-[#06b6d4]">setTimeout</span>
                  {"(() => fn(...args), "}
                  <span className="text-[#f59e0b]">delay</span>
                  {");\n  };\n}"}
                </code>
              </pre>
              <div className="px-5 pb-5">
                <span className="mb-2.5 block text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#f59e0b]">
                  AI Generated Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {["typescript", "utility", "performance", "debounce"].map(
                    (tag, i) => (
                      <span
                        key={tag}
                        className="animate-[tag-in_0.45s_ease_forwards] rounded-full border border-[color-mix(in_srgb,#3b82f6_30%,transparent)] bg-[color-mix(in_srgb,#3b82f6_13%,transparent)] px-[11px] py-1 font-mono text-[0.78rem] text-[#3b82f6] opacity-0"
                        style={{ animationDelay: `${0.1 + i * 0.15}s` }}
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <PricingToggle />

      {/* ====== CTA ====== */}
      <ScrollReveal>
        <section className="mx-auto max-w-[800px] px-6 pb-24 pt-10 text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-tight">
            Ready to Start?
          </h2>
          <p className="mt-3.5 mb-7 text-[1.1rem] text-muted-foreground">
            Join developers who never lose a snippet, prompt, or command again.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center rounded-[9px] px-[26px] py-[13px] text-[1rem] font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_8px_26px_rgba(99,102,241,0.45)]"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            Get Started for Free
          </Link>
        </section>
      </ScrollReveal>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-[#232838] bg-[#11141d]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 pb-10 pt-14 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[1.12rem] font-extrabold text-foreground"
            >
              <span
                className="grid h-[30px] w-[30px] place-items-center rounded-lg text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                aria-hidden
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
              DevMemory
            </Link>
            <p className="mt-3 text-[0.92rem] text-[#6b7384]">
              Your developer knowledge hub.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h4 className="mb-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#6b7384]">
                Product
              </h4>
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Changelog", href: "#" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="block py-1 text-[0.92rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4 className="mb-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#6b7384]">
                Company
              </h4>
              {["About", "Blog", "Contact"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="block py-1 text-[0.92rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4 className="mb-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#6b7384]">
                Legal
              </h4>
              {["Privacy", "Terms"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="block py-1 text-[0.92rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#232838] py-5 text-center text-[0.88rem] text-[#6b7384]">
          &copy; {new Date().getFullYear()} DevMemory. All rights reserved.
        </div>
      </footer>
    </>
  );
}

const FEATURES = [
  {
    color: "#3b82f6",
    title: "Code Snippets",
    desc: "Save reusable code with syntax highlighting across every language you touch.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  },
  {
    color: "#8b5cf6",
    title: "AI Prompts",
    desc: "Keep your best prompts and system messages organized and ready to reuse.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>',
  },
  {
    color: "#10b981",
    title: "Instant Search",
    desc: "Find anything across content, tags, titles, and types the moment you need it.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  },
  {
    color: "#f97316",
    title: "Commands",
    desc: "Stop digging through shell history — store one-off commands where you can find them.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  },
  {
    color: "#6b7280",
    title: "Files & Docs",
    desc: "Upload context files, images, and docs to secure cloud storage.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  },
  {
    color: "#10b981",
    title: "Collections",
    desc: "Group related items into curated collections — an item can live in many at once.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:23px;height:23px"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  },
];
