"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "../Icon";
import { uploadMedia } from "@/lib/upload-client";

type Job = { name: string; status: "queued" | "uploading" | "done" | "error"; pct: number; msg?: string };

export function Uploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drag, setDrag] = useState(false);
  const busy = jobs.some((j) => j.status === "uploading" || j.status === "queued");

  async function send(file: File, i: number) {
    setJobs((js) => js.map((j, k) => (k === i ? { ...j, status: "uploading" } : j)));
    try {
      await uploadMedia(file, { albumId, onProgress: (pct) => setJobs((js) => js.map((j, k) => (k === i ? { ...j, pct } : j))) });
      setJobs((js) => js.map((j, k) => (k === i ? { ...j, status: "done", pct: 100 } : j)));
    } catch (e) {
      setJobs((js) => js.map((j, k) => (k === i ? { ...j, status: "error", msg: e instanceof Error ? e.message : "Upload failed" } : j)));
    }
  }

  async function handle(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    const start = jobs.length;
    setJobs((js) => [...js, ...list.map((f) => ({ name: f.name, status: "queued" as const, pct: 0 }))]);
    for (let n = 0; n < list.length; n += 3) {
      await Promise.all(list.slice(n, n + 3).map((f, k) => send(f, start + n + k)));
    }
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${drag ? "border-orange bg-sand/40" : "border-night/30 bg-cream/60"}`}>
        <Icon name="camera" className="size-10 text-forest" />
        <p className="font-display text-lg font-bold text-forest">Drag photos and videos here</p>
        <p className="text-sm text-moss">or</p>
        <button type="button" className="btn btn-primary" onClick={() => input.current?.click()} disabled={busy}><Icon name="upload" className="size-5" />Choose files</button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => { if (e.target.files) handle(e.target.files); e.target.value = ""; }} />
      </div>
      {jobs.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
          {jobs.map((j, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl border-2 border-night/10 bg-white px-4 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-semibold">{j.name}</span>
              {j.status === "error" ? <span className="font-semibold text-brown">{j.msg ?? "Failed"}</span>
                : j.status === "done" ? <span className="inline-flex items-center gap-1 font-semibold text-forest"><Icon name="check" className="size-4" strokeWidth={3} />Added</span>
                : <span className="flex w-40 items-center gap-2"><span className="h-2 flex-1 overflow-hidden rounded-full bg-cream"><span className="block h-full bg-olive transition-[width]" style={{ width: `${j.pct}%` }} /></span>{j.status === "queued" ? "Waiting" : j.pct === 100 ? "Processing" : `${j.pct}%`}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
