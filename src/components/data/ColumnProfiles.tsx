import { ChartCard } from "@/components/netflix/ChartCard";
import { fmtNum, type Dataset } from "@/lib/dataset";

const typeLabel: Record<string, string> = {
  number: "Number",
  date: "Date",
  category: "Category",
  text: "Text",
};

export function ColumnProfiles({ ds }: { ds: Dataset }) {
  return (
    <ChartCard title="Column guide" subtitle="What each column contains, in plain language">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ds.columns.map((c) => {
          const completeness = ((ds.rows.length - c.missing) / Math.max(1, ds.rows.length)) * 100;
          return (
            <div key={c.name} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium" title={c.name}>
                  {c.name}
                </p>
                <span className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                  {typeLabel[c.type]}
                </span>
              </div>

              {c.type === "number" ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ranges {fmtNum(c.min ?? 0)} – {fmtNum(c.max ?? 0)}, average{" "}
                  <span className="text-foreground">{fmtNum(c.mean ?? 0)}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.unique.toLocaleString()} different values
                  {c.top?.[0] ? (
                    <>
                      , most often <span className="text-foreground">{c.top[0].value}</span>
                    </>
                  ) : null}
                </p>
              )}

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                <div className="h-full bg-primary" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {completeness.toFixed(0)}% filled in
                {c.missing ? ` · ${c.missing.toLocaleString()} blank` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
