import { useState } from "react";

import { ChartCard } from "@/components/netflix/ChartCard";
import { AutoChart } from "./AutoChart";
import {
  aggLabels,
  type Agg,
  type ChartSpec,
  type ChartType,
  type Dataset,
} from "@/lib/dataset";

const chartTypes: { id: ChartType; label: string }[] = [
  { id: "bar", label: "Bars" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "pie", label: "Pie" },
  { id: "scatter", label: "Scatter" },
];

const selectClass =
  "rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function ChartBuilder({ ds }: { ds: Dataset }) {
  // Prefer category columns for grouping — they give meaningful bars.
  // Fall back to any column only if no categories exist.
  const cats = ds.columns.filter((c) => c.type === "category" && c.unique > 1 && c.unique <= 60);
  const groupable = cats.length
    ? cats
    : ds.columns.filter((c) => c.type !== "text");
  const measures = ds.columns.filter((c) => c.type === "number");

  const [type, setType] = useState<ChartType>("bar");
  const [x, setX] = useState(groupable[0]?.name ?? ds.columns[0]?.name ?? "");
  const [y, setY] = useState<string>(measures[0]?.name ?? "");
  // Default to 'avg' — shows variation better than 'sum' for most datasets
  const [agg, setAgg] = useState<Agg>(measures.length ? "avg" : "count");
  const [limit, setLimit] = useState(12);

  const selectedXCol = ds.columns.find((c) => c.name === x);
  const xIsNumeric = selectedXCol?.type === "number";

  const spec: ChartSpec = {
    id: "custom",
    title: "Custom chart",
    type,
    x,
    y: agg === "count" ? null : y || null,
    agg,
    limit,
  };

  return (
    <ChartCard
      title="Build your own chart"
      subtitle="Pick what to group by, what to measure, and how to show it"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Chart type
          <select
            className={selectClass}
            value={type}
            onChange={(e) => setType(e.target.value as ChartType)}
          >
            {chartTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          {type === "scatter" ? "Horizontal value" : "Group by"}
          <select className={selectClass} value={x} onChange={(e) => setX(e.target.value)}>
            {(type === "scatter" ? measures : groupable).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          {type === "scatter" ? "Vertical value" : "Measure"}
          <select
            className={selectClass}
            value={y}
            onChange={(e) => setY(e.target.value)}
            disabled={agg === "count" && type !== "scatter"}
          >
            {measures.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
            {!measures.length ? <option value="">No numeric columns</option> : null}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Summarise with
          <select
            className={selectClass}
            value={agg}
            onChange={(e) => setAgg(e.target.value as Agg)}
            disabled={type === "scatter"}
          >
            {(Object.keys(aggLabels) as Agg[]).map((a) => (
              <option key={a} value={a}>
                {aggLabels[a]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Show top {limit}
          <input
            type="range"
            min={3}
            max={40}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={type === "scatter"}
            className="mt-3 h-1 cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
        </label>
      </div>

      {/* Warn when user picks a continuous numeric as group-by — suggests binning */}
      {xIsNumeric && type !== "scatter" && (
        <p className="mb-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
          ⚠ <strong>{x}</strong> is a continuous number — bars may all look the same.
          Try switching <strong>Group by</strong> to a category column for better variation.
        </p>
      )}

      <AutoChart rows={ds.rows} spec={spec} height={340} />
    </ChartCard>
  );
}
