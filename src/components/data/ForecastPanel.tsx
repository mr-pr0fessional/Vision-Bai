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

import { ChartCard, ChartTooltip, axisProps } from "@/components/netflix/ChartCard";
import { aggregate, fmtNum, type Dataset } from "@/lib/dataset";
import { project, type ModelId } from "@/lib/forecast";

const models: { id: ModelId; label: string; blurb: string }[] = [
  { id: "linear", label: "Steady", blurb: "A fixed amount added each step" },
  { id: "cagr", label: "Compounding", blurb: "A constant percentage gain each step" },
  { id: "logistic", label: "S-curve", blurb: "Growth that slows as it approaches a ceiling" },
];

const selectClass =
  "rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function ForecastPanel({ ds }: { ds: Dataset }) {
  const timeCols = ds.columns.filter(
    (c) => c.type === "number" || c.type === "date" || c.type === "category",
  );
  const measures = ds.columns.filter((c) => c.type === "number");

  const [xKey, setXKey] = useState(
    (timeCols.find((c) => /year|date|month|time|period/i.test(c.name)) ?? timeCols[0])?.name ?? "",
  );
  const [yKey, setYKey] = useState(measures.find((c) => c.name !== xKey)?.name ?? "");
  const [model, setModel] = useState<ModelId>("linear");
  const [horizon, setHorizon] = useState(5);

  const history = useMemo(() => {
    if (!xKey || !yKey) return [];
    return aggregate(ds.rows, xKey, yKey, "sum", 500, false)
      .map((d, i) => ({ year: Number(d.label), label: d.label, value: d.value, i }))
      .map((d) => ({ year: Number.isFinite(d.year) ? d.year : d.i, label: d.label, value: d.value }));
  }, [ds.rows, xKey, yKey]);

  const numericSteps = history.every((h) => Number.isFinite(Number(h.label)));

  const result = useMemo(() => {
    if (history.length < 4) return null;
    return project(
      history.map((h) => ({ year: h.year, value: h.value })),
      model,
      horizon,
    );
  }, [history, model, horizon]);

  if (!measures.length) {
    return (
      <ChartCard title="Future prediction" subtitle="Needs at least one numeric column">
        <p className="text-sm text-muted-foreground">
          This dataset has no numeric column to project forward.
        </p>
      </ChartCard>
    );
  }

  const rows = result?.rows ?? [];
  const chartRows = rows.map((r) => ({
    ...r,
    label: numericSteps ? String(r.year) : (history.find((h) => h.year === r.year)?.label ?? `+${r.year}`),
    band: r.lower !== null && r.upper !== null ? [r.lower, r.upper] : null,
  }));

  const last = history[history.length - 1];
  const target = rows[rows.length - 1];
  const change = last && target && last.value !== 0 ? ((target.fitted - last.value) / Math.abs(last.value)) * 100 : 0;

  return (
    <ChartCard
      title="Future prediction"
      subtitle="Fit a trend to your history and project it forward"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Time / order column
          <select className={selectClass} value={xKey} onChange={(e) => setXKey(e.target.value)}>
            {timeCols.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          What to predict
          <select className={selectClass} value={yKey} onChange={(e) => setYKey(e.target.value)}>
            {measures.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Trend shape
          <select
            className={selectClass}
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.blurb}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs tracking-wider text-muted-foreground uppercase">
          Steps ahead: {horizon}
          <input
            type="range"
            min={1}
            max={12}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="mt-3 h-1 cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
        </label>
      </div>

      {!result ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Pick a time column with at least four points to see a projection.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartRows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={16} />
              <YAxis {...axisProps} width={56} tickFormatter={(v: number) => fmtNum(v)} />
              <Tooltip content={<ChartTooltip />} />
              {last ? (
                <ReferenceLine
                  x={numericSteps ? String(last.year) : last.label}
                  stroke="var(--chart-2)"
                  strokeDasharray="4 4"
                  label={{
                    value: "today",
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                    position: "top",
                  }}
                />
              ) : null}
              <Area
                dataKey="band"
                name="Likely range"
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
                name="Predicted"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            <div className="bg-card p-4">
              <p className="font-display text-3xl">{fmtNum(target?.fitted ?? 0)}</p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                Predicted {yKey} after {horizon} step{horizon > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="font-display text-3xl">
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                Change versus the latest value
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="font-display text-3xl">{result.fit.r2.toFixed(3)}</p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                Fit quality (1.0 = perfect)
              </p>
            </div>
          </div>

          <p className="mt-4 font-mono text-xs break-words text-muted-foreground">
            {result.fit.equation}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The shaded band shows the likely range, based on how far past points sat from the fitted
            line. It widens the further ahead you look. A projection is an extrapolation of past
            behaviour, not a guarantee.
          </p>
        </>
      )}
    </ChartCard>
  );
}
