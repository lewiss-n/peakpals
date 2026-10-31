"use client";

import { useActionState, useState } from "react";
import { saveAlbum } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/public";

type V = { id?: string; title: string; date: string; location: string; story: string; guideNote: string; eventId: string; published: boolean };

export function AlbumForm({ initial, events }: { initial?: V; events: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAlbum, { ok: false });
  const [v, setV] = useState<V>(initial ?? { title: "", date: new Date().toISOString().slice(0, 10), location: "", story: "", guideNote: "", eventId: "", published: true });
  const err = state.errors ?? {};
  const set = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <form action={action} className="sticker mt-4 grid gap-5 bg-white p-6 md:grid-cols-2" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="md:col-span-2"><label className="label" htmlFor="title">Album title</label><input id="title" name="title" className="field" value={v.title} onChange={set("title")} placeholder="e.g. Ngong Hills, March 2026" />{err.title && <p className="mt-1 text-sm font-semibold text-brown">{err.title}</p>}</div>
      <div><label className="label" htmlFor="date">Date</label><input id="date" name="date" type="date" className="field" value={v.date} onChange={set("date")} />{err.date && <p className="mt-1 text-sm font-semibold text-brown">{err.date}</p>}</div>
      <div><label className="label" htmlFor="location">Location</label><input id="location" name="location" className="field" value={v.location} onChange={set("location")} /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="eventId">Linked event (optional)</label>
        <select id="eventId" name="eventId" className="field" value={v.eventId} onChange={set("eventId")}><option value="">None</option>{events.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></div>
      <div className="md:col-span-2"><label className="label" htmlFor="story">Story of the day</label><textarea id="story" name="story" rows={4} className="field" value={v.story} onChange={set("story")} /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="guideNote">Guide&apos;s note (short, shown handwritten)</label><input id="guideNote" name="guideNote" maxLength={200} className="field" value={v.guideNote} onChange={set("guideNote")} /></div>
      <label className="flex items-center gap-3 font-semibold md:col-span-2"><input type="checkbox" name="published" className="size-5 accent-forest" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />Show this album on the website</label>
      {state.message && <p role="status" className={`rounded-2xl p-3 font-semibold md:col-span-2 ${state.ok ? "bg-olive/15" : "bg-brown/10 text-brown"}`}>{state.message}</p>}
      <div className="md:col-span-2"><button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : v.id ? "Save details" : "Create album"}</button></div>
    </form>
  );
}
