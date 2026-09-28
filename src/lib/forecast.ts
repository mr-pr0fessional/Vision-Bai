/**
 * Dependency-free curve fitting and projection helpers.
 * All models fit y as a function of x (year offset from the first data year).
 */

export type ModelId = "linear" | "cagr" | "logistic";

export type Point = { x: number; y: number };

export type Fit = {
  model: ModelId;
  /** Predict y for a given x */
  predict: (x: number) => number;
  /** Coefficient of determination on the training data */
  r2: number;
  /** Residual standard error */
  se: number;
  /** Human-readable fitted equation */
  equation: string;
};

function r2AndSe(points: Point[], predict: (x: number) => number) {
  const mean = points.reduce((s, p) => s + p.y, 0) / points.length;
  let ssRes = 0;
  let ssTot = 0;
  for (const p of points) {
    const e = p.y - predict(p.x);
    ssRes += e * e;
    ssTot += (p.y - mean) * (p.y - mean);
  }
  const dof = Math.max(1, points.length - 2);
  return { r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot, se: Math.sqrt(ssRes / dof) };
}

function fmt(n: number, d = 2) {
  return Number(n.toFixed(d)).toString();
}

function fitLinear(points: Point[]): Fit {
  const n = points.length;
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const predict = (x: number) => intercept + slope * x;
  return {
    model: "linear",
    predict,
    ...r2AndSe(points, predict),
    equation: `y = ${fmt(slope)}·t + ${fmt(intercept)}`,
  };
}

function fitCagr(points: Point[]): Fit {
  const usable = points.filter((p) => p.y > 0);
  const n = usable.length;
  const sx = usable.reduce((s, p) => s + p.x, 0);
  const sy = usable.reduce((s, p) => s + Math.log(p.y), 0);
  const sxy = usable.reduce((s, p) => s + p.x * Math.log(p.y), 0);
  const sxx = usable.reduce((s, p) => s + p.x * p.x, 0);
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const a = Math.exp((sy - b * sx) / n);
  const predict = (x: number) => a * Math.exp(b * x);
  return {
    model: "cagr",
    predict,
    ...r2AndSe(points, predict),
    equation: `y = ${fmt(a)}·e^(${fmt(b, 3)}·t)  →  ${fmt((Math.exp(b) - 1) * 100, 1)}% per year`,
  };
}

/** Logistic (S-curve) fit via grid search over the saturation ceiling L. */
function fitLogistic(points: Point[]): Fit {
  const maxY = Math.max(...points.map((p) => p.y));
  let best: Fit | null = null;

  for (let mult = 1.05; mult <= 4; mult += 0.05) {
    const L = maxY * mult;
    // linearise: ln(L/y - 1) = -k(x - x0)
    const lin = points
      .filter((p) => p.y > 0 && p.y < L)
      .map((p) => ({ x: p.x, y: Math.log(L / p.y - 1) }));
    if (lin.length < 3) continue;
    const n = lin.length;
    const sx = lin.reduce((s, p) => s + p.x, 0);
    const sy = lin.reduce((s, p) => s + p.y, 0);
    const sxy = lin.reduce((s, p) => s + p.x * p.y, 0);
    const sxx = lin.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;
    const k = -slope;
    if (!Number.isFinite(k) || k <= 0) continue;
    const x0 = intercept / k;
    const predict = (x: number) => L / (1 + Math.exp(-k * (x - x0)));
    const stats = r2AndSe(points, predict);
    if (!best || stats.r2 > best.r2) {
      best = {
        model: "logistic",
        predict,
        ...stats,
        equation: `y = ${fmt(L, 0)} / (1 + e^(−${fmt(k, 3)}·(t − ${fmt(x0, 1)})))  →  ceiling ≈ ${fmt(L, 0)}`,
      };
    }
  }

  return best ?? fitLinear(points);
}

export function fitModel(points: Point[], model: ModelId): Fit {
  if (model === "cagr") return fitCagr(points);
  if (model === "logistic") return fitLogistic(points);
  return fitLinear(points);
}

export type ProjectionRow = {
  year: number;
  actual: number | null;
  fitted: number;
  lower: number | null;
  upper: number | null;
};

/**
 * Fit `model` to (year, value) history and project `horizon` years forward.
 * The confidence band widens with distance from the last observed year.
 */
export function project(
  history: { year: number; value: number }[],
  model: ModelId,
  horizon: number,
): { rows: ProjectionRow[]; fit: Fit } {
  const baseYear = history[0]!.year;
  const points = history.map((h) => ({ x: h.year - baseYear, y: h.value }));
  const fit = fitModel(points, model);
  const lastYear = history[history.length - 1]!.year;

  const rows: ProjectionRow[] = history.map((h) => ({
    year: h.year,
    actual: h.value,
    fitted: Math.max(0, fit.predict(h.year - baseYear)),
    lower: null,
    upper: null,
  }));

  for (let i = 1; i <= horizon; i++) {
    const year = lastYear + i;
    const fitted = Math.max(0, fit.predict(year - baseYear));
    const spread = 1.96 * fit.se * Math.sqrt(i);
    rows.push({
      year,
      actual: null,
      fitted,
      lower: Math.max(0, fitted - spread),
      upper: fitted + spread,
    });
  }

  // Connect the actual line to the forecast band at the seam.
  const seam = rows.find((r) => r.year === lastYear);
  if (seam) {
    seam.lower = seam.fitted;
    seam.upper = seam.fitted;
  }

  return { rows, fit };
}
