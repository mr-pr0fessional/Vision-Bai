import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { yearly } from "@/data/netflix";
import { project, type ModelId } from "@/lib/forecast";
import { ChartCard, ChartTooltip, axisProps } from "./ChartCard";

const models: { id: ModelId; label: string; blurb: string }[] = [
  { id: "logistic", label: "S-curve", blurb: "Growth slows as the market saturates" },
  { id: "cagr", label: "Compound", blurb: "Constant percentage growth every year" },
  { id: "linear", label: "Linear", blurb: "A fixed amount added every year" },
];

type Metric = "subscribers" | "revenue";

const metrics: { id: Metric; label: string; unit: string; help: string }[] = [
  { id: "subscribers", label: "Members", unit: "M", help: "millions of paid memberships" },
  { id: "revenue", label: "Revenue", unit: "B", help: "billions of US dollars" },
];

export function Forecast() {
  const [metric, setMetric] = useState<Metric>("subscribers");
  const [model, setModel] = useState<ModelId>("logistic");
  const [horizon, setHorizon] = useState(5);

  const meta = metrics.find((m) => m.id === metric)!;

  const { rows, fit } = useMemo(() => {
    const history = yearly.map((r) => ({ year: r.year, value: r[metric] }));
    return project(history, model, horizon);
  }, [metric, model, horizon]);

  const lastActualYear = yearly[yearly.length - 1]!.year;
  const lastActual = yearly[yearly.length - 1]![metric];
  const target = rows[rows.length - 1]!;
  const change = ((target.fitted - lastActual) / lastActual) * 100;

  const chartRows = rows.map((r) => ({
    ...r,
    band: r.lower !== null && r.upper !== null ? [r.lower, r.upper] : null,
  }));

  return (
    <ChartCard
      title="Future prediction"
      subtitle={`Fitting historical ${meta.help} and projecting ${horizon} year${horizon > 1 ? "s" : ""} ahead`}
    >
      <div className="mb-5 grid gap-4 lg:grid-cols-[auto_auto_1fr] lg:items-center">
        <div className="inline-flex rounded-md border border-border p-1">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                metric === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-md border border-border p-1">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              title={m.blurb}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                model === m.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Horizon</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="h-1 w-full max-w-56 cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
          <span className="font-display text-base text-foreground">
            {lastActualYear + horizon}
          </span>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartRows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis {...axisProps} unit={meta.unit} />
          <Tooltip content={<ChartTooltip suffix={meta.unit} />} />
          <ReferenceLine
            x={lastActualYear}
            stroke="var(--chart-2)"
            strokeDasharray="4 4"
            label={{ value: "today", fill: "var(--muted-foreground)", fontSize: 11, position: "top" }}
          />
          <Area
            dataKey="band"
            name="Confidence range"
            stroke="none"
            fill="var(--chart-1)"
            fillOpacity={0.16}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="fitted"
            name="Model"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        <div className="bg-card p-4">
          <p className="font-display text-3xl">
            {metric === "revenue" ? "$" : ""}
            {target.fitted.toFixed(metric === "revenue" ? 1 : 0)}
            {meta.unit}
          </p>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
            Projected {meta.label.toLowerCase()} in {target.year}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="font-display text-3xl">
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
            Change versus {lastActualYear}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="font-display text-3xl">{fit.r2.toFixed(3)}</p>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
            R² — how well the model fits history
          </p>
        </div>
      </div>

      <p className="mt-4 font-mono text-xs break-words text-muted-foreground">{fit.equation}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {model === "logistic"
          ? "The S-curve assumes Netflix is approaching a natural ceiling of connected households, so each additional year adds fewer members than the last."
          : model === "cagr"
            ? "Compound growth assumes the same percentage gain every year — optimistic for a business this mature, but useful as an upper bound."
            : "A linear fit assumes Netflix keeps adding the same absolute amount each year, ignoring both acceleration and saturation."}{" "}
        The shaded range is a 95% band derived from how far past years sat from the fitted curve; it
        widens the further out the projection runs.
      </p>
    </ChartCard>
  );
}
