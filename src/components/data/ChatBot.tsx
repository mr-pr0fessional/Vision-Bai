import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Fish,
  BookMarked,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { buildDatasetContext } from "@/lib/dataset-context";
import {
  buildKnowledgeContext,
  loadKnowledge,
  newItem,
  saveKnowledge,
  type KnowledgeItem,
} from "@/lib/knowledge";
import type { Dataset } from "@/lib/dataset";
import { cn } from "@/lib/utils";

const MSG_KEY = "visionbai.chat.messages";
const MEM_KEY = "visionbai.chat.memory";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as T) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function textOf(m: UIMessage) {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

export function ChatBot({ ds }: { ds: Dataset | null }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [memory, setMemory] = useState<string[]>([]);
  const [kb, setKb] = useState<KnowledgeItem[]>([]);
  const [showKb, setShowKb] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: "visionbai-chat",
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  // Restore after hydration so server and client render the same first paint.
  useEffect(() => {
    setMessages(readJson<UIMessage[]>(MSG_KEY, []));
    setMemory(readJson<string[]>(MEM_KEY, []));
    setKb(loadKnowledge());
    setHydrated(true);
  }, [setMessages]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(MSG_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* storage full or blocked — chat still works for this session */
    }
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(MEM_KEY, JSON.stringify(memory.slice(-25)));
    } catch {
      /* ignore */
    }
  }, [memory, hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && !busy && !showKb) inputRef.current?.focus();
  }, [open, busy, showKb]);

  const context = useMemo(() => buildDatasetContext(ds), [ds]);
  const knowledge = useMemo(() => buildKnowledgeContext(kb), [kb]);

  function updateKb(items: KnowledgeItem[]) {
    setKb(items);
    saveKnowledge(items);
  }

  function saveCurrentDataset() {
    if (!ds) return;
    updateKb([...kb, newItem(`Dataset: ${ds.name}`, buildDatasetContext(ds))]);
    setShowKb(true);
  }

  function addNote() {
    if (!noteBody.trim()) return;
    updateKb([...kb, newItem(noteTitle, noteBody)]);
    setNoteTitle("");
    setNoteBody("");
  }

  // Client-side topic guard — catches obvious off-topic queries before hitting the model.
  // The server system prompt is the second line of defence.
  const OFF_TOPIC_PATTERNS = [
    /\b(recipe|biryani|cook(ing)?|bake|baking|food|dish|meal|cuisine|ingredient|masala|curry|pizza|pasta|bread|cake|fry(ing)?|boil(ing)?|grill(ing)?|saut\u00e9)\b/i,
    /\b(movie|film|song|music|actor|actress|cricket|football|sport|game|fifa|ipl|ott|netflix|youtube)\b/i,
    /\b(doctor|medicine|treatment|hospital|diagnos|symptom|disease|health|fitness|diet|calories|weight loss)\b/i,
    /\b(capital of|population of|history of|who is|who was|president|prime minister|election|politics|war|country|continent)\b/i,
    /\b(write (me |a |some )?(code|program|script|function|class)|debug (this|my)|fix (this|my) code)\b/i,
  ];

  function isOffTopic(text: string): boolean {
    return OFF_TOPIC_PATTERNS.some((re) => re.test(text));
  }

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;

    // Fast client-side refusal for clearly off-topic queries.
    if (isOffTopic(value)) {
      const refusal: UIMessage = {
        id: `refusal-${Date.now()}`,
        role: "assistant",
        parts: [{
          type: "text",
          text: "Query is beyond data set, add required data set!! I'm your site-side data buddy — ask me about your schedule, BOQ, costs, materials or progress!",
        }],
        metadata: {},
      };
      const userMsg: UIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text: value }],
        metadata: {},
      };
      setMessages((prev) => [...prev, userMsg, refusal]);
      setInput("");
      return;
    }

    setMemory((m) => [...m, value]);
    setInput("");
    void sendMessage(
      { text: value },
      { body: { context, knowledge, memory: memory.slice(-15).join(" | ") } },
    );
  }

  const suggestions = ds
    ? [
        "Where is this project losing time?",
        "Summarise cost vs budget",
        "Any material wastage concerns?",
      ]
    : ["What construction data can I analyse?", "Help me track project delays"];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed right-5 bottom-5 z-50 inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>

      <div
        className={cn(
          "fixed right-5 bottom-20 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all duration-300",
          open
            ? "pointer-events-auto max-h-[min(32rem,calc(100dvh-7rem))] opacity-100"
            : "pointer-events-none max-h-0 translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Fish className="size-4 text-primary" />
            <div>
              <p className="font-display text-sm tracking-wide uppercase">Guppy</p>
              <p className="text-[11px] text-muted-foreground">
                {ds ? `Reading ${ds.name}` : "Site, cost & schedule questions"}
                {kb.length ? ` · ${kb.length} saved` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKb((s) => !s)}
              aria-label="Saved knowledge"
              className={cn(
                "rounded-md p-1.5 transition-colors hover:text-foreground",
                showKb ? "text-primary" : "text-muted-foreground",
              )}
            >
              <BookMarked className="size-4" />
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setMemory([]);
              }}
              aria-label="Clear conversation"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {showKb ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Save anything you want the assistant to remember — site notes, rates, specs or a whole
              dataset. Stored in this browser only.
            </p>

            <button
              onClick={saveCurrentDataset}
              disabled={!ds}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60 disabled:opacity-40"
            >
              <Save className="size-4" /> {ds ? `Save "${ds.name}" to memory` : "Load a dataset first"}
            </button>

            <div className="space-y-2 rounded-md border border-border p-3">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Title (e.g. Tower A pour rates)"
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
                placeholder="What should I remember?"
                className="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={addNote}
                disabled={!noteBody.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-40"
              >
                <Plus className="size-4" /> Save note
              </button>
            </div>

            {kb.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
            ) : (
              kb
                .slice()
                .reverse()
                .map((i) => (
                  <div
                    key={i.id}
                    className="flex items-start gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{i.body}</p>
                    </div>
                    <button
                      onClick={() => updateKb(kb.filter((k) => k.id !== i.id))}
                      aria-label={`Delete ${i.title}`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ask about your construction data — progress, delays, costs, materials, manpower or
                  safety. I use your saved notes and datasets to answer.
                </p>
              ) : null}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary/15 text-foreground"
                      : "bg-muted/40 text-foreground",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1">
                      <ReactMarkdown>{textOf(m)}</ReactMarkdown>
                    </div>
                  ) : (
                    textOf(m)
                  )}
                </div>
              ))}

              {status === "submitted" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Thinking…
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">
                  {error.message || "The assistant could not answer. Please try again."}
                </p>
              ) : null}
              <div ref={endRef} />
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border p-3"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about your site data…"
                className="max-h-28 min-h-9 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
