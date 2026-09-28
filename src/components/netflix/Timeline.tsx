import { milestones } from "@/data/netflix";

export function Timeline() {
  return (
    <section className="surface p-5 sm:p-6">
      <h2 className="font-display text-lg tracking-wide uppercase">Eras &amp; milestones</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The decisions that bent the growth curve.
      </p>

      <ol className="mt-6 grid gap-px overflow-hidden rounded-md bg-border sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((m) => (
          <li key={m.year} className="group bg-card p-4 transition-colors hover:bg-secondary">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-primary" />
              <span className="font-display text-2xl tracking-tight">{m.year}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{m.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
