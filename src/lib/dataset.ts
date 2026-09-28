/**
 * Dependency-free dataset profiling, aggregation and insight helpers.
 * Everything runs in the browser on the rows the user uploaded.
 */

export type Row = Record<string, unknown>;

export type ColumnType = "number" | "date" | "category" | "text";

export type Column = {
  name: string;
  type: ColumnType;
  missing: number;
  unique: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  /** most frequent values, for category columns */
  top?: { value: string; count: number }[];
};

export type Dataset = {
  name: string;
  rows: Row[];
  columns: Column[];
};

const DATE_RE = /^\d{4}[-/]\d{1,2}([-/]\d{1,2})?([ T].*)?$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/;

export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const cleaned = v.replace(/[$,%\s,]/g, "").replace(/^\((.*)\)$/, "-$1");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function isBlank(v: unknown) {
  return v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v));
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next !== undefined ? sorted[base]! + rest * (next - sorted[base]!) : sorted[base]!;
}

export function profileColumn(name: string, rows: Row[]): Column {
  const values = rows.map((r) => r[name]);
  const present = values.filter((v) => !isBlank(v));
  const missing = values.length - present.length;
  const uniqueSet = new Set(present.map((v) => String(v)));

  const numbers = present.map(toNumber).filter((n): n is number => n !== null);
  const numericShare = present.length ? numbers.length / present.length : 0;

  if (numericShare > 0.85 && present.length > 0) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
    const variance = numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / Math.max(1, numbers.length - 1);
    return {
      name,
      type: "number",
      missing,
      unique: uniqueSet.size,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      mean,
      median: quantile(sorted, 0.5),
      std: Math.sqrt(variance),
    };
  }

  const dateShare = present.length
    ? present.filter((v) => typeof v === "string" && DATE_RE.test(v.trim())).length / present.length
    : 0;
  if (dateShare > 0.85 && present.length > 0) {
    return { name, type: "date", missing, unique: uniqueSet.size };
  }

  const counts = new Map<string, number>();
  for (const v of present) {
    const k = String(v);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const isText = uniqueSet.size > Math.max(50, present.length * 0.6);
  return { name, type: isText ? "text" : "category", missing, unique: uniqueSet.size, top };
}

export function buildDataset(name: string, rows: Row[]): Dataset {
  const keys = new Set<string>();
  for (const r of rows.slice(0, 200)) Object.keys(r).forEach((k) => keys.add(k));
  const columns = [...keys].filter((k) => k !== "").map((k) => profileColumn(k, rows));
  return { name, rows, columns };
}

/* ---------------------------------- charts --------------------------------- */

export type Agg = "sum" | "avg" | "count" | "min" | "max";
export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export type ChartSpec = {
  id: string;
  title: string;
  type: ChartType;
  x: string;
  y: string | null;
  agg: Agg;
  limit?: number;
};

export const aggLabels: Record<Agg, string> = {
  sum: "Total",
  avg: "Average",
  count: "Count of rows",
  min: "Minimum",
  max: "Maximum",
};

export function aggregate(
  rows: Row[],
  x: string,
  y: string | null,
  agg: Agg,
  limit = 20,
  sortByValue = true,
): { label: string; value: number }[] {
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    const key = isBlank(r[x]) ? "(blank)" : String(r[x]);
    const v = y ? toNumber(r[y]) : 1;
    if (y && v === null) continue;
    const bucket = groups.get(key) ?? [];
    bucket.push(v ?? 1);
    groups.set(key, bucket);
  }

  let out = [...groups.entries()].map(([label, vals]) => {
    let value: number;
    switch (agg) {
      case "count":
        value = vals.length;
        break;
      case "avg":
        value = vals.reduce((s, n) => s + n, 0) / vals.length;
        break;
      case "min":
        value = Math.min(...vals);
        break;
      case "max":
        value = Math.max(...vals);
        break;
      default:
        value = vals.reduce((s, n) => s + n, 0);
    }
    return { label, value: Math.round(value * 1000) / 1000 };
  });

  if (sortByValue) out.sort((a, b) => b.value - a.value);
  else out.sort((a, b) => naturalCompare(a.label, b.label));

  return out.slice(0, limit);
}

function naturalCompare(a: string, b: string) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return a.localeCompare(b);
}

/** Suggest a starter set of charts based on the shape of the data. */
export function suggestCharts(ds: Dataset): ChartSpec[] {
  const numbers = ds.columns.filter((c) => c.type === "number");
  const cats = ds.columns
    .filter((c) => c.type === "category" && c.unique > 1 && c.unique <= 60)
    .sort((a, b) => a.unique - b.unique);
  const times = ds.columns.filter(
    (c) => c.type === "date" || (c.type === "number" && /year|date|month|time/i.test(c.name)),
  );

  const specs: ChartSpec[] = [];
  const measure = numbers.find((c) => !times.some((t) => t.name === c.name));

  if (times[0] && measure) {
    specs.push({
      id: "trend",
      title: `${measure.name} over ${times[0].name}`,
      type: "area",
      x: times[0].name,
      y: measure.name,
      agg: "sum",
      limit: 200,
    });
  }
  if (cats[0] && measure) {
    specs.push({
      id: "bycat",
      title: `Avg ${measure.name} by ${cats[0].name}`,
      type: "bar",
      x: cats[0].name,
      y: measure.name,
      agg: "avg",   // avg shows variation across categories
      limit: 12,
    });
  }
  if (cats[0]) {
    specs.push({
      id: "share",
      title: `Record count by ${cats[0].name}`,
      type: "pie",
      x: cats[0].name,
      y: null,
      agg: "count",
      limit: 8,
    });
  }
  if (cats[1] && measure) {
    specs.push({
      id: "bycat2",
      title: `Total ${measure.name} by ${cats[1].name}`,
      type: "bar",
      x: cats[1].name,
      y: measure.name,
      agg: "sum",
      limit: 12,
    });
  }
  // Distribution histogram for numeric columns without a time axis
  const distNum = numbers.find(
    (c) => !times.some((t) => t.name === c.name) && c !== measure && (c.std ?? 0) > 0,
  ) ?? (measure && !times.some((t) => t.name === measure.name) ? undefined : null);
  if (distNum) {
    specs.push({
      id: "dist",
      title: `${distNum.name} distribution`,
      type: "bar",
      x: distNum.name,
      y: null,
      agg: "count",
      limit: 15,
    });
  }
  return specs;
}

/* --------------------------------- insights -------------------------------- */

export function correlation(rows: Row[], a: string, b: string): number | null {
  const pairs: [number, number][] = [];
  for (const r of rows) {
    const x = toNumber(r[a]);
    const y = toNumber(r[b]);
    if (x !== null && y !== null) pairs.push([x, y]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}

export function generateInsights(ds: Dataset): string[] {
  const out: string[] = [];
  const numbers = ds.columns.filter((c) => c.type === "number");
  const cats = ds.columns.filter((c) => c.type === "category");

  out.push(
    `Your file has ${ds.rows.length.toLocaleString()} rows and ${ds.columns.length} columns — ${numbers.length} numeric, ${cats.length} categorical.`,
  );

  const worst = [...ds.columns].sort((a, b) => b.missing - a.missing)[0];
  if (worst && worst.missing > 0) {
    const pct = (worst.missing / ds.rows.length) * 100;
    out.push(
      `“${worst.name}” is the least complete column — ${worst.missing.toLocaleString()} empty values (${pct.toFixed(1)}% of rows).`,
    );
  } else {
    out.push("Every column is fully filled in — no missing values were found.");
  }

  const spread = numbers
    .filter((c) => c.mean && c.std)
    .sort((a, b) => b.std! / Math.abs(b.mean!) - a.std! / Math.abs(a.mean!))[0];
  if (spread) {
    out.push(
      `“${spread.name}” varies the most, ranging from ${fmtNum(spread.min!)} to ${fmtNum(spread.max!)} with an average of ${fmtNum(spread.mean!)}.`,
    );
  }

  const cat = cats.find((c) => c.top && c.top.length > 1);
  if (cat?.top?.[0]) {
    const share = (cat.top[0].count / ds.rows.length) * 100;
    out.push(
      `The most common “${cat.name}” is “${cat.top[0].value}”, covering ${share.toFixed(1)}% of all rows.`,
    );
  }

  let bestPair: { a: string; b: string; r: number } | null = null;
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const r = correlation(ds.rows, numbers[i]!.name, numbers[j]!.name);
      if (r !== null && (!bestPair || Math.abs(r) > Math.abs(bestPair.r))) {
        bestPair = { a: numbers[i]!.name, b: numbers[j]!.name, r };
      }
    }
  }
  if (bestPair && Math.abs(bestPair.r) > 0.5) {
    out.push(
      `“${bestPair.a}” and “${bestPair.b}” move ${bestPair.r > 0 ? "together" : "in opposite directions"} (correlation ${bestPair.r.toFixed(2)}) — when one goes up the other tends to go ${bestPair.r > 0 ? "up" : "down"}.`,
    );
  }

  return out;
}

export function fmtNum(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (abs >= 10) return n.toFixed(0);
  return Number(n.toFixed(3)).toString();
}

export function toCsv(rows: Row[], columns: string[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
}
