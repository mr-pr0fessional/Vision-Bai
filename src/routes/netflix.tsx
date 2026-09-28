import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { yearly } from "@/data/netflix";
import { ContentLibrary } from "@/components/netflix/ContentLibrary";
import { Forecast } from "@/components/netflix/Forecast";
import { GrowthCharts } from "@/components/netflix/GrowthCharts";
import { Hero } from "@/components/netflix/Hero";
import { Timeline } from "@/components/netflix/Timeline";

const FIRST_YEAR = yearly[0]!.year;
const LAST_YEAR = yearly[yearly.length - 1]!.year;

const title = "Netflix Growth Story — Data Visualization & 2030 Forecast";
const description =
  "Interactive charts of Netflix subscribers, revenue, regions and catalog from 1997 to today, plus an S-curve forecast of company growth through 2030.";

export const Route = createFileRoute("/netflix")({
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

function Index() {
  const [from, setFrom] = useState(1999);
  const [yoy, setYoy] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:py-16">
        <div className="surface flex flex-wrap items-center gap-x-8 gap-y-4 p-4 sm:p-5">
          <label className="flex flex-1 items-center gap-3 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">
              From <span className="font-display text-base text-foreground">{from}</span> to{" "}
              {LAST_YEAR}
            </span>
            <input
              type="range"
              min={FIRST_YEAR}
              max={LAST_YEAR - 3}
              step={1}
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="h-1 w-full max-w-72 cursor-pointer appearance-none rounded-full bg-border accent-primary"
              aria-label="Start year"
            />
          </label>

          <button
            onClick={() => setYoy((v) => !v)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              yoy
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {yoy ? "Showing growth %" : "Show growth %"}
          </button>
        </div>

        <GrowthCharts from={from} to={LAST_YEAR} yoy={yoy} />

        <Timeline />

        <h2 className="mt-6 font-display text-2xl tracking-wide uppercase">Content library</h2>
        <ContentLibrary />

        <h2 className="mt-6 font-display text-2xl tracking-wide uppercase">Where it goes next</h2>
        <Forecast />
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground">
          <p>
            Financial and membership figures are curated from Netflix&apos;s public annual reports
            and quarterly shareholder letters; catalog figures come from the widely used public
            Netflix titles dataset. The most recent year is approximate, and all projections are
            statistical extrapolations of historical data — not investment advice.
          </p>
          <p className="mt-3">Netflix is a trademark of Netflix, Inc. This is an independent visualization.</p>
        </div>
      </footer>
    </main>
  );
}
