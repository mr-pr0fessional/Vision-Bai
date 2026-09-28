/**
 * A small browser-side knowledge base for the construction assistant.
 * Everything the user chooses to save (dataset snapshots, site notes,
 * standards, rates) is kept in localStorage and sent as RAG context.
 */
export type KnowledgeItem = {
  id: string;
  title: string;
  body: string;
  savedAt: number;
};

const KB_KEY = "visionbai.kb.items";

export function loadKnowledge(): KnowledgeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KB_KEY);
    const parsed = raw ? (JSON.parse(raw) as KnowledgeItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveKnowledge(items: KnowledgeItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KB_KEY, JSON.stringify(items.slice(-40)));
  } catch {
    /* storage blocked — knowledge stays for this session only */
  }
}

export function newItem(title: string, body: string): KnowledgeItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim() || "Untitled note",
    body: body.trim(),
    savedAt: Date.now(),
  };
}

/** Compact text block of saved knowledge for the model prompt. */
export function buildKnowledgeContext(items: KnowledgeItem[]): string {
  if (items.length === 0) return "";
  return items
    .map((i) => `### ${i.title}\n${i.body}`)
    .join("\n\n")
    .slice(0, 20000);
}
