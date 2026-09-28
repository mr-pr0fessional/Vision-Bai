import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, RotateCcw, ShieldCheck, Wand2, Zap } from "lucide-react";

import { AutoDashboard } from "@/components/data/AutoDashboard";
import { ChartBuilder } from "@/components/data/ChartBuilder";
import { ChatBot } from "@/components/data/ChatBot";
import { ColumnProfiles } from "@/components/data/ColumnProfiles";
import { DataTable } from "@/components/data/DataTable";
import { ForecastPanel } from "@/components/data/ForecastPanel";
import { SectionDeck } from "@/components/data/SectionDeck";
import { Uploader } from "@/components/data/Uploader";
import type { Dataset } from "@/lib/dataset";

function DeckTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="shrink-0">
      <p className="text-xs tracking-[0.3em] text-primary uppercase">{kicker}</p>
      <h1 className="mt-1 font-display text-2xl tracking-wide uppercase sm:text-3xl">{title}</h1>
    </div>
  );
}


const title = "VISION Bai — Upload Any Dataset, Get Instant Dashboards";
const description =
  "Drop in a CSV, TSV or JSON file and get instant charts, plain-language insights, a custom chart builder and a future forecast. No sign-up, no upload — everything runs in your browser.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Zap,
    title: "Instant dashboard",
    body: "Charts and key numbers appear the moment your file loads — no setup, no formulas.",
  },
  {
    icon: Wand2,
    title: "Plain-language insights",
    body: "Written findings explain what stands out, so anyone can read the results.",
  },
  {
    icon: BarChart3,
    title: "Build your own view",
    body: "Group, measure and switch chart types with simple dropdowns.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your file is read inside your browser and never sent anywhere.",
  },
];

function Index() {
  const [ds, setDs] = useState<Dataset | null>(null);

  return (
    <main
      className={
        ds
          ? "h-dvh overflow-hidden bg-background text-foreground"
          : "min-h-screen bg-background text-foreground"
      }
    >
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <span className="font-display text-lg tracking-[0.2em] uppercase text-foreground">
            VISION <span className="text-white">B</span>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent align-super text-base tracking-normal normal-case">
              ai
            </span>
          </span>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/netflix" className="transition-colors hover:text-foreground">
              DEMO
            </Link>
            {ds ? (
              <button
                onClick={() => setDs(null)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-4" /> New dataset
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      {!ds ? (
        <>
          <section className="mx-auto max-w-3xl px-5 pt-16 pb-8 text-center">
            <p className="text-xs tracking-[0.3em] text-primary uppercase">
              Data visualization for everyone
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-wide uppercase sm:text-6xl">
              Turn any spreadsheet into a dashboard
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Upload a file and get charts, clear explanations and a forecast in seconds. Built for
              people who do not write code.
            </p>
          </section>

          <section className="mx-auto max-w-4xl px-5 pb-6">
            <Uploader onLoad={setDs} />
          </section>

          <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="surface p-5">
                <f.icon className="size-5 text-primary" />
                <h2 className="mt-3 font-display text-base tracking-wide uppercase">{f.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </section>
        </>
      ) : (
        <SectionDeck
          sections={[
            {
              id: "overview",
              label: "Overview",
              content: (
                <>
                  <DeckTitle kicker="Dashboard" title={ds.name} />
                  <AutoDashboard ds={ds} view="kpis" />
                </>
              ),
            },
            {
              id: "charts",
              label: "Charts",
              content: (
                <>
                  <DeckTitle kicker="Suggested" title="Automatic charts" />
                  <AutoDashboard ds={ds} view="charts" />
                </>
              ),
            },
            {
              id: "builder",
              label: "Chart builder",
              content: (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ChartBuilder ds={ds} />
                </div>
              ),
            },
            {
              id: "forecast",
              label: "Forecast",
              content: (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ForecastPanel ds={ds} />
                </div>
              ),
            },
            {
              id: "columns",
              label: "Columns",
              content: (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ColumnProfiles ds={ds} />
                </div>
              ),
            },
            {
              id: "table",
              label: "Data",
              content: (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <DataTable ds={ds} />
                </div>
              ),
            },
          ]}
        />
      )}

      {!ds ? (
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground">
            <p>
              Files are parsed locally in your browser — nothing is uploaded or stored. Forecasts
              are statistical extrapolations of the data you provide, not advice.
            </p>
          </div>
        </footer>
      ) : null}

      <ChatBot ds={ds} />
    </main>
  );
}
