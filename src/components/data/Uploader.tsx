import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";

import { parseFile } from "@/lib/parse-file";
import { loadSample, samples, type SampleId } from "@/lib/samples";
import type { Dataset } from "@/lib/dataset";

export function Uploader({ onLoad }: { onLoad: (ds: Dataset) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        onLoad(await parseFile(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : "That file could not be read.");
      } finally {
        setBusy(false);
      }
    },
    [onLoad],
  );

  const pickSample = (id: SampleId) => {
    setError(null);
    onLoad(loadSample(id));
  };

  return (
    <div className="grid gap-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`surface flex cursor-pointer flex-col items-center gap-3 px-6 py-14 text-center transition-colors ${
          dragging ? "border-primary bg-secondary/60" : "hover:border-primary/60"
        }`}
      >
        {busy ? (
          <Loader2 className="size-8 animate-spin text-primary" />
        ) : (
          <Upload className="size-8 text-primary" />
        )}
        <p className="font-display text-xl tracking-wide uppercase">
          {busy ? "Reading your file…" : "Drop your data file here"}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          CSV, TSV or JSON — up to 50,000 rows. Your file never leaves your browser; nothing is
          uploaded to a server.
        </p>
        <span className="mt-1 rounded-md border border-border px-4 py-2 text-sm">
          Choose a file
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.json"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <p className="mb-3 text-sm text-muted-foreground">Or explore a ready-made example:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => pickSample(s.id)}
              className="surface flex items-start gap-3 p-4 text-left transition-colors hover:border-primary/60"
            >
              <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
