import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DeckSection = { id: string; label: string; content: ReactNode };

/**
 * Full-screen, non-scrollable section deck.
 * Scrolling "digs" through layers: the current layer scales up, blurs and
 * fades away while the next layer rises from behind it.
 */
export function SectionDeck({ sections }: { sections: DeckSection[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const lockRef = useRef(false);
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    const go = (delta: number) => {
      if (lockRef.current) return;
      const next = indexRef.current + delta;
      if (next < 0 || next >= sections.length) return;
      lockRef.current = true;
      setDir(delta > 0 ? 1 : -1);
      setIndex(next);
      window.setTimeout(() => {
        lockRef.current = false;
      }, 780);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) go(1);
      if (["ArrowUp", "PageUp"].includes(e.key)) go(-1);
    };
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? 0;
      if (Math.abs(y - startY) > 45) {
        go(y < startY ? 1 : -1);
        startY = y;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [sections.length]);

  return (
    <div className="relative h-[calc(100dvh-61px)] w-full overflow-hidden [perspective:1200px]">
      {sections.map((s, i) => {
        const active = i === index;
        const passed = i < index;
        // "digging" — layers above the current one blow past the camera,
        // layers below rise up from depth.
        const style = active
          ? { opacity: 1, transform: "translateZ(0) scale(1)", filter: "blur(0px)" }
          : passed
            ? {
                opacity: 0,
                transform: `scale(${1 + 0.35 * Math.min(index - i, 2)})`,
                filter: "blur(14px)",
              }
            : { opacity: 0, transform: "scale(0.82)", filter: "blur(10px)" };

        return (
          <section
            key={s.id}
            aria-hidden={!active}
            style={{
              ...style,
              transitionDuration: "760ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={cn(
              "absolute inset-0 transition-all will-change-transform",
              active ? "pointer-events-auto z-10" : "pointer-events-none z-0",
            )}
          >
            <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 overflow-hidden px-5 py-6">
              {s.content}
            </div>
          </section>
        );
      })}

      {/* progress rail */}
      <div className="absolute top-1/2 right-4 z-20 flex -translate-y-1/2 flex-col gap-3">
        {sections.map((s, i) => (
          <button
            key={s.id}
            title={s.label}
            aria-label={s.label}
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "h-6 w-2 bg-primary" : "w-2 bg-border hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
        {dir === 1 && index === sections.length - 1
          ? "Scroll up to go back"
          : "Scroll to dig deeper"}
      </div>
    </div>
  );
}
