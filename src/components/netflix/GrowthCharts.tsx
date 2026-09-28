import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { milestones, regional, regionMeta, yearly } from "@/data/netflix";
import { ChartCard, ChartTooltip, axisProps } from "./ChartCard";

type Props = { from: number; to: number; yoy: boolean };

const grid = <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />;

export function GrowthCharts({ from, to, yoy }: Props) {
  const rows = useMemo(() => {
    const filtered = yearly.filter((r) => r.year >= from && r.year <= to);
    return filtered.map((r) => {
      const prev = yearly.find((p) => p.year === r.year - 1);
      const arpu = (r.revenue * 1000) / 12 / r.subscribers; // USD per member per month
      return {
        ...r,
        arpu,
        subGrowth: prev ? ((r.subscribers - prev.subscribers) / prev.subscribers) * 100 : 0,
        revGrowth: prev ? ((r.revenue - prev.revenue) / prev.revenue) * 100 : 0,
      };
    });
  }, [from, to]);

  const regionRows = useMemo(
    () => regional.filter((r) => r.year >= from && r.year <= to),
    [from, to],
  );

  const latestRegion = regional[regional.length - 1]!;
  const donut = regionMeta.map((m) => ({
    name: m.label,
    value: latestRegion[m.key],
    color: m.color,
  }));

  const visibleMilestones = milestones.filter((m) => m.year >= from && m.year <= to);

  return (
    <div className="grid gap-6">
      <ChartCard
        title="Global paid memberships"
        subtitle={
          yoy
            ? "Year-over-year membership growth (%)"
            : "Members at year end, in millions, with milestone markers"
        }
      >
        <ResponsiveContainer width="100%" height={340}>
          {yoy ? (
            <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              {grid}
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} unit="%" />
              <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: "var(--secondary)" }} />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" />
              <Bar dataKey="subGrowth" name="Member growth" radius={[3, 3, 0, 0]}>
                {rows.map((r) => (
                  <Cell
                    key={r.year}
                    fill={r.subGrowth >= 0 ? "var(--chart-1)" : "var(--muted-foreground)"}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="subsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} unit="M" />
              <Tooltip content={<ChartTooltip suffix="M" />} cursor={{ stroke: "var(--border)" }} />
              {visibleMilestones.map((m) => (
                <ReferenceLine
                  key={m.year}
                  x={m.year}
                  stroke="var(--chart-2)"
                  strokeDasharray="2 4"
                  strokeOpacity={0.7}
                />
              ))}
              <Area
                type="monotone"
                dataKey="subscribers"
                name="Members"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#subsFill)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
        {!yoy && visibleMilestones.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Dashed markers:{" "}
            {visibleMilestones.map((m) => `${m.year} ${m.title.toLowerCase()}`).join(" · ")}
          </p>
        ) : null}
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue &amp; ARPU"
          subtitle={
            yoy
              ? "Year-over-year revenue growth (%)"
              : "Annual revenue (bars, $B) against monthly revenue per member (line, $)"
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            {yoy ? (
              <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                {grid}
                <XAxis dataKey="year" {...axisProps} />
                <YAxis {...axisProps} unit="%" />
                <Tooltip
                  content={<ChartTooltip suffix="%" />}
                  cursor={{ fill: "var(--secondary)" }}
                />
                <ReferenceLine y={0} stroke="var(--muted-foreground)" />
                <Bar
                  dataKey="revGrowth"
                  name="Revenue growth"
                  fill="var(--chart-2)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            ) : (
              <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                {grid}
                <XAxis dataKey="year" {...axisProps} />
                <YAxis yAxisId="left" {...axisProps} unit="B" />
                <YAxis yAxisId="right" orientation="right" {...axisProps} unit="$" />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue ($B)"
                  fill="var(--chart-1)"
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="arpu"
                  name="ARPU ($/mo)"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Members by region"
          subtitle="Regional reporting begins in 2017, in millions"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={regionRows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              {grid}
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} unit="M" />
              <Tooltip content={<ChartTooltip suffix="M" />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {regionMeta.map((m) => (
                <Area
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stackId="1"
                  stroke={m.color}
                  fill={m.color}
                  fillOpacity={0.35}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title={`Regional share, ${latestRegion.year}`}
        subtitle="Where Netflix's members live today"
      >
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={donut}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={100}
                paddingAngle={2}
                stroke="var(--card)"
              >
                {donut.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip suffix="M" />} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="grid gap-3">
            {donut.map((d) => {
              const total = donut.reduce((s, x) => s + x.value, 0);
              return (
                <li key={d.name} className="flex items-center gap-3 text-sm">
                  <span
                    className="size-3 rounded-sm"
                    style={{ backgroundColor: d.color }}
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-display text-lg">
                    {((d.value / total) * 100).toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </ChartCard>
    </div>
  );
}
