import { aggregate, fmtNum, generateInsights, type Dataset } from "./dataset";

/**
 * Builds a compact, retrieval-style text context describing the dataset the
 * user uploaded, so the assistant can answer questions about it accurately.
 */
export function buildDatasetContext(ds: Dataset | null): string {
  if (!ds) return "The user has not loaded a dataset yet.";

  const lines: string[] = [];
  lines.push(`DATASET: ${ds.name}`);
  lines.push(`ROWS: ${ds.rows.length}  COLUMNS: ${ds.columns.length}`);

  lines.push("\nCOLUMN PROFILES:");
  for (const c of ds.columns) {
    if (c.type === "number") {
      lines.push(
        `- ${c.name} (number): min ${fmtNum(c.min ?? 0)}, max ${fmtNum(c.max ?? 0)}, mean ${fmtNum(
          c.mean ?? 0,
        )}, median ${fmtNum(c.median ?? 0)}, missing ${c.missing}`,
      );
    } else if (c.type === "category") {
      const top = (c.top ?? [])
        .slice(0, 6)
        .map((t) => `${t.value} (${t.count})`)
        .join(", ");
      lines.push(`- ${c.name} (category): ${c.unique} unique, missing ${c.missing}. Top: ${top}`);
    } else {
      lines.push(`- ${c.name} (${c.type}): ${c.unique} unique, missing ${c.missing}`);
    }
  }

  lines.push("\nAUTOMATIC INSIGHTS:");
  for (const i of generateInsights(ds)) lines.push(`- ${i}`);

  // Pre-computed aggregates give the model real numbers to reason with.
  const numbers = ds.columns.filter((c) => c.type === "number");
  const cats = ds.columns.filter((c) => c.type === "category" && c.unique > 1 && c.unique <= 40);
  const measure = numbers[0];
  if (measure) {
    for (const cat of cats.slice(0, 2)) {
      const rowsAgg = aggregate(ds.rows, cat.name, measure.name, "sum", 10);
      lines.push(
        `\nTOTAL ${measure.name} BY ${cat.name} (top 10): ` +
          rowsAgg.map((r) => `${r.label}=${fmtNum(r.value)}`).join(", "),
      );
    }
  }

  const names = ds.columns.map((c) => c.name);
  const sample = ds.rows.slice(0, 12);
  lines.push("\nSAMPLE ROWS (first 12):");
  lines.push(names.join(" | "));
  for (const r of sample) {
    lines.push(names.map((n) => String(r[n] ?? "")).join(" | "));
  }

  return lines.join("\n").slice(0, 24000);
}
