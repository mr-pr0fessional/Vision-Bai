import { yearly, genres } from "@/data/netflix";

const latest = yearly[yearly.length - 1]!;
const catalogTitles = genres.reduce((s, g) => s + g.count, 0);

const stats = [
  { label: "Paid memberships", value: `${Math.round(latest.subscribers)}M` },
  { label: "Annual revenue", value: `$${latest.revenue.toFixed(1)}B` },
  { label: "Catalog genre tags", value: catalogTitles.toLocaleString() },
  { label: "Years in business", value: `${latest.year - 1997}` },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 0%, color-mix(in oklch, var(--primary) 35%, transparent) 0%, transparent 60%), radial-gradient(60% 50% at 90% 20%, color-mix(in oklch, var(--accent) 18%, transparent) 0%, transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <p className="font-display text-sm tracking-[0.35em] text-primary uppercase">
          Netflix, Inc.
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight uppercase sm:text-7xl">
          1997 <span className="text-primary">→</span> 2030
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          From a DVD-by-mail startup in Scotts Valley to the world&apos;s largest streaming
          service. Explore three decades of subscriber, revenue and catalog data — then project
          where the curve goes next.
        </p>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card p-5">
              <dd className="font-display text-3xl tracking-tight sm:text-4xl">{s.value}</dd>
              <dt className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
