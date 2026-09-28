import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { countries, genres, ratings, titlesAdded } from "@/data/netflix";
import { ChartCard, ChartTooltip, axisProps } from "./ChartCard";

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ContentLibrary() {
  const catalogTotal = genres.reduce((s, g) => s + g.count, 0);

  return (
    <div className="grid gap-6">
      <ChartCard
        title="Titles added per year"
        subtitle="Movies versus series added to the catalog"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={titlesAdded} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="movies" name="Movies" stackId="t" fill="var(--chart-1)" />
            <Bar
              dataKey="shows"
              name="TV shows"
              stackId="t"
              fill="var(--chart-2)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top genres" subtitle={`${catalogTotal.toLocaleString()} genre tags across the catalog`}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={genres}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 40, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" width={120} {...axisProps} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="count" name="Titles" fill="var(--chart-1)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Producing countries" subtitle="Where Netflix catalog titles come from">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={countries}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 40, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" width={120} {...axisProps} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="count" name="Titles" fill="var(--chart-2)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Maturity ratings" subtitle="Who the catalog is made for">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ratings}
              dataKey="count"
              nameKey="name"
              outerRadius={110}
              stroke="var(--card)"
              label={({ name }) => name}
            >
              {ratings.map((r, i) => (
                <Cell key={r.name} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
