import Papa from "papaparse";

import { buildDataset, type Dataset, type Row } from "./dataset";

const MAX_ROWS = 50_000;

export async function parseFile(file: File): Promise<Dataset> {
  const text = await file.text();
  const name = file.name.replace(/\.[^.]+$/, "");
  if (/\.json$/i.test(file.name)) return parseJsonText(name, text);
  return parseDelimitedText(name, text);
}

export function parseDelimitedText(name: string, text: string): Dataset {
  const result = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });
  const rows = (result.data as Row[]).filter((r) => Object.keys(r).length > 0).slice(0, MAX_ROWS);
  if (!rows.length) throw new Error("No readable rows were found in that file.");
  return buildDataset(name, rows);
}

export function parseJsonText(name: string, text: string): Dataset {
  const parsed: unknown = JSON.parse(text);
  const arr = Array.isArray(parsed)
    ? parsed
    : Object.values(parsed as Record<string, unknown>).find(Array.isArray);
  if (!Array.isArray(arr) || !arr.length) {
    throw new Error("That JSON file does not contain a list of records.");
  }
  return buildDataset(name, arr as Row[]);
}
