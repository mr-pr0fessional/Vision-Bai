import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, axisProps } from "@/components/netflix/ChartCard";
import { aggregate, fmtNum, toNumber, type ChartSpec, type Row } from "@/lib/dataset";

export const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Single-hue value-scaled colour for bar charts — makes variation pop */
function barColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  // t: 0 (lowest) → 1 (highest)
  const t = Math.max(0, Math.min(1, (value - min) / range));
  // Interpolate: low = steel-blue tint, high = deep primary red
  const r = Math.round(30 + t * 205);   // 30 → 235
  const g = Math.round(130 - t * 110);  // 130 → 20
  const b = Math.round(180 - t * 150);  // 180 → 30
  return `rgb(${r},${g},${b})`;
}

/** Truncate long labels for x-axis display */
function shortLabel(s: string, max = 13): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function AutoChart({
  rows,
  spec,
  height = 300,
}: {
  rows: Row[];
  spec: ChartSpec;
  height?: number;
}) {
  if (spec.type === "scatter") {
    const points = rows
      .map((r) => ({ x: toNumber(r[spec.x]), y: spec.y ? toNumber(r[spec.y]) : null }))
      .filter((p): p is { x: number; y: number } => p.x !== null && p.y !== null)
      .slice(0, 3000);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={spec.x} {...axisProps} />
          <YAxis type="number" dataKey="y" name={spec.y ?? ""} {...axisProps} />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={points} fill="var(--chart-1)" name={`${spec.x} vs ${spec.y}`} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const sortByValue = spec.type === "bar" || spec.type === "pie";
  const data = aggregate(rows, spec.x, spec.y, spec.agg, spec.limit ?? 20, sortByValue);
  const name = spec.y ? `${spec.agg === "count" ? "Rows" : spec.y}` : "Rows";

  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No values to chart for this combination.
      </p>
    );
  }

  if (spec.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            outerRadius={Math.min(120, height / 2.6)}
            stroke="var(--card)"
            label={({ name: n }: { name?: string }) => n ?? ""}
          >
            {data.map((d, i) => (
              <Cell key={d.label} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const margin = { top: 8, right: 12, left: -8, bottom: 0 };

  if (spec.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={margin}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...axisProps} tickFormatter={(v: number) => fmtNum(v)} width={56} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
          <Line
            type="monotone"
            dataKey="value"
            name={name}
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={data.length <= 40}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={margin}>
          <defs>
            <linearGradient id="autoFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...axisProps} tickFormatter={(v: number) => fmtNum(v)} width={56} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
          <Area
            type="monotone"
            dataKey="value"
            name={name}
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#autoFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  const vals = data.map((d) => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const meanVal = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  // If all values identical, fall back to palette cycling (avoids flat grey)
  const useHeatmap = maxVal - minVal > 0;

  // Y domain: start at 0 if all positive, else auto; add 10% headroom at top
  const yMin = minVal >= 0 ? 0 : "auto";
  const yMax = maxVal + Math.abs(maxVal) * 0.12 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -4, bottom: 40 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          {...axisProps}
          interval={0}
          angle={-35}
          textAnchor="end"
          tick={{ ...axisProps.tick, fontSize: 10 }}
          tickFormatter={(v: string) => shortLabel(String(v))}
          minTickGap={4}
        />
        <YAxis
          {...axisProps}
          tickFormatter={(v: number) => fmtNum(v)}
          width={60}
          domain={[yMin, yMax]}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        {/* Mean reference line so variation is contextualised */}
        <ReferenceLine
          y={meanVal}
          stroke="var(--chart-3)"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{ value: `avg ${fmtNum(meanVal)}`, fill: "var(--muted-foreground)", fontSize: 10, position: "insideTopRight" }}
        />
        <Bar dataKey="value" name={name} radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((d, i) => (
            <Cell
              key={d.label}
              fill={useHeatmap ? barColor(d.value, minVal, maxVal) : palette[i % palette.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
