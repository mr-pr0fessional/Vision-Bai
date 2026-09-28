import { Sparkles, Table2, TrendingUp, Layers } from "lucide-react";

import { ChartCard } from "@/components/netflix/ChartCard";
import { fmtNum, generateInsights, suggestCharts, type Dataset } from "@/lib/dataset";
import { AutoChart } from "./AutoChart";

export function AutoDashboard({ ds, view = "all" }: { ds: Dataset; view?: "all" | "kpis" | "charts" }) {
  const specs = suggestCharts(ds);
  const insights = generateInsights(ds);
  const numbers = ds.columns.filter((c) => c.type === "number");
  const headline = numbers.slice(0, 2);

  const kpis = [
    { icon: Table2, label: "Rows", value: fmtNum(ds.rows.length) },
    { icon: Layers, label: "Columns", value: String(ds.columns.length) },
    ...headline.map((c) => ({
      icon: TrendingUp,
      label: `Total ${c.name}`,
      value: fmtNum((c.mean ?? 0) * ds.rows.length),
    })),
  ].slice(0, 4);

  const showKpis = view !== "charts";
  const showCharts = view !== "kpis";

  return (
    <div className="grid min-h-0 flex-1 content-start gap-4 overflow-hidden">
      {showKpis ? (
        <>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card p-4">
                <k.icon className="size-4 text-primary" />
                <p className="mt-2 font-display text-2xl">{k.value}</p>
                <p className="mt-1 truncate text-xs tracking-wider text-muted-foreground uppercase">
                  {k.label}
                </p>
              </div>
            ))}
          </div>

          <ChartCard
            title="What your data says"
            subtitle="Automatic findings, written in everyday language"
          >
            <ul className="grid gap-2.5">
              {insights.slice(0, 5).map((line, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </>
      ) : null}

      {showCharts ? (
        specs.length ? (
          <div className="grid min-h-0 gap-4 lg:grid-cols-2">
            {specs.slice(0, view === "charts" ? 2 : specs.length).map((spec) => (
              <ChartCard key={spec.id} title={spec.title} className="min-w-0">
                <AutoChart rows={ds.rows} spec={spec} height={view === "charts" ? 340 : 300} />
              </ChartCard>
            ))}
          </div>
        ) : (
          <ChartCard title="Suggested charts">
            <p className="text-sm text-muted-foreground">
              No obvious chart could be suggested for this file — use the chart builder to make your
              own.
            </p>
          </ChartCard>
        )
      ) : null}
    </div>
  );
}

