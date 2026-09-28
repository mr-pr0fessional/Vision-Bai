import { useMemo, useState } from "react";
import { ArrowUpDown, Download, Search } from "lucide-react";

import { ChartCard } from "@/components/netflix/ChartCard";
import { toCsv, toNumber, type Dataset } from "@/lib/dataset";

const PAGE = 25;

export function DataTable({ ds }: { ds: Dataset }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const cols = ds.columns.map((c) => c.name);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = q
      ? ds.rows.filter((r) => cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q)))
      : ds.rows;
    if (sort) {
      out = [...out].sort((a, b) => {
        const na = toNumber(a[sort.key]);
        const nb = toNumber(b[sort.key]);
        if (na !== null && nb !== null) return (na - nb) * sort.dir;
        return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * sort.dir;
      });
    }
    return out;
  }, [ds.rows, cols, query, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages - 1);
  const slice = rows.slice(current * PAGE, current * PAGE + PAGE);

  const download = () => {
    const blob = new Blob([toCsv(rows, cols)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ds.name || "data"}-filtered.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChartCard
      title="Your data"
      subtitle={`${rows.length.toLocaleString()} of ${ds.rows.length.toLocaleString()} rows`}
      action={
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Download className="size-4" /> Export CSV
        </button>
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search anything in this table…"
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50">
            <tr>
              {cols.map((c) => (
                <th key={c} className="p-0">
                  <button
                    onClick={() =>
                      setSort((s) =>
                        s?.key === c ? { key: c, dir: s.dir === 1 ? -1 : 1 } : { key: c, dir: 1 },
                      )
                    }
                    className="flex w-full items-center gap-1.5 px-3 py-2.5 text-xs tracking-wider whitespace-nowrap text-muted-foreground uppercase hover:text-foreground"
                  >
                    {c}
                    <ArrowUpDown className="size-3 opacity-60" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i} className="border-t border-border/70">
                {cols.map((c) => (
                  <td key={c} className="max-w-64 truncate px-3 py-2">
                    {String(r[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {current + 1} of {pages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={current >= pages - 1}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </ChartCard>
  );
}
