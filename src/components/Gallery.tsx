"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { mediaUrl } from "@/lib/media-url";

type Item = { id: string; kind: "IMAGE" | "VIDEO"; file: string; thumb: string | null; blur: string | null; caption: string | null; alt: string | null; width: number | null; height: number | null; mime: string };

export function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const x0 = useRef<number | null>(null);

  const show = (i: number) => { setOpen(i); dlg.current?.showModal(); };
  const close = () => { dlg.current?.close(); };
  const go = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    const onClose = () => setOpen(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => { el.removeEventListener("keydown", onKey); el.removeEventListener("close", onClose); };
  }, [go]);

  if (!items.length) return <p className="sticker bg-cream p-8 text-center font-display text-xl font-bold text-forest">Photos from this day are on their way.</p>;
  const cur = open !== null ? items[open] : null;

  return (
    <>
      <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {items.map((m, i) => (
          <li key={m.id} className="mb-5 break-inside-avoid">
            <button type="button" onClick={() => show(i)} className="group relative block w-full overflow-hidden rounded-2xl border-2 border-night bg-forest text-left shadow-[5px_5px_0_#1F3320] transition-transform hover:-translate-y-1" aria-label={`Open ${m.kind === "VIDEO" ? "video" : "photo"} ${i + 1} of ${items.length}${m.caption ? `: ${m.caption}` : ""}`}>
              {m.kind === "IMAGE" ? (
                <img src={mediaUrl(m.thumb ?? m.file)!} alt={m.alt ?? m.caption ?? ""} width={m.width ?? undefined} height={m.height ?? undefined} loading="lazy" className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  style={m.blur ? { backgroundImage: `url(${m.blur})`, backgroundSize: "cover" } : undefined} />
              ) : (
                <div className="relative">
                  <video src={`${mediaUrl(m.file)}#t=0.5`} preload="metadata" muted playsInline className="aspect-video w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center"><span className="flex size-16 items-center justify-center rounded-full border-2 border-night bg-gold"><Icon name="play" className="size-7 translate-x-0.5" /></span></span>
                </div>
              )}
              {m.caption && <span className="hand absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent px-4 pb-2 pt-10 text-2xl leading-tight text-cream">{m.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-night/90" aria-label="Photo viewer">
        {cur && (
          <div className="relative flex size-full flex-col items-center justify-center gap-3 p-4"
            onPointerDown={(e) => { x0.current = e.clientX; }}
            onPointerUp={(e) => { if (x0.current === null) return; const dx = e.clientX - x0.current; x0.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
            <button type="button" onClick={close} className="absolute right-4 top-4 z-10 inline-flex size-12 items-center justify-center rounded-full border-2 border-night bg-cream" aria-label="Close"><Icon name="x" className="size-6" /></button>
            {cur.kind === "IMAGE" ? (
              <img src={mediaUrl(cur.file)!} alt={cur.alt ?? cur.caption ?? ""} className="max-h-[80dvh] max-w-full rounded-xl border-2 border-cream/30 object-contain" />
            ) : (
              <video key={cur.id} src={mediaUrl(cur.file)!} controls autoPlay playsInline className="max-h-[80dvh] max-w-full rounded-xl" />
            )}
            <div className="flex w-full max-w-3xl items-center justify-between gap-4 text-cream">
              <button type="button" onClick={() => go(-1)} className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-cream/40 hover:bg-cream/10" aria-label="Previous"><Icon name="arrow" className="size-6 rotate-180" /></button>
              <p className="text-center"><span className="hand block text-2xl text-sand">{cur.caption}</span><span className="text-sm text-cream/70">{(open ?? 0) + 1} / {items.length}</span></p>
              <button type="button" onClick={() => go(1)} className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-cream/40 hover:bg-cream/10" aria-label="Next"><Icon name="arrow" className="size-6" /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
