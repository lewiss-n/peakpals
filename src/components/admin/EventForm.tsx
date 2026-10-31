"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveEvent } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/public";
import { Icon } from "../Icon";
import { uploadMedia } from "@/lib/upload-client";

type V = {
  id?: string; title: string; slug: string; activity: string; difficulty: string; zone: string; region: string; meetingPoint: string; startsAt: string;
  durationHours: string; distanceKm: string; elevationGainM: string; highestPointM: string; priceKes: string; capacity: string; guideRatio: string; instructor: string;
  summary: string; description: string; inclusions: string; bring: string; published: boolean; coverMediaId: string; coverUrl: string;
};

const EMPTY: V = {
  title: "", slug: "", activity: "HIKE", difficulty: "MODERATE", zone: "NEAR_NAIROBI", region: "", meetingPoint: "", startsAt: "",
  durationHours: "", distanceKm: "", elevationGainM: "", highestPointM: "", priceKes: "", capacity: "20", guideRatio: "", instructor: "",
  summary: "", description: "", inclusions: "", bring: "", published: true, coverMediaId: "", coverUrl: "",
};

export function EventForm({ initial }: { initial?: V }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveEvent, { ok: false });
  const [v, setV] = useState<V>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState("");
  const err = state.errors ?? {};
  const set = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  async function upload(f: File) {
    setUploading(true); setUpErr("");
    try {
      const r = await uploadMedia(f);
      setV((x) => ({ ...x, coverMediaId: r.id, coverUrl: r.url }));
    } catch (e) { setUpErr(e instanceof Error ? e.message : "Upload failed"); }
    setUploading(false);
  }

  const F = ({ k, label, type = "text", hint, ...rest }: { k: keyof V; label: string; type?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} name={k} type={type} className="field" value={String(v[k])} onChange={set(k)} aria-invalid={!!err[k]} {...rest} />
      {hint && !err[k] && <p className="mt-1 text-sm text-moss">{hint}</p>}
      {err[k] && <p className="mt-1 text-sm font-semibold text-brown">{err[k]}</p>}
    </div>
  );
  const S = ({ k, label, options }: { k: keyof V; label: string; options: [string, string][] }) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <select id={k} name={k} className="field" value={String(v[k])} onChange={set(k)}>{options.map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select>
    </div>
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-6" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="coverMediaId" value={v.coverMediaId} />

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">The basics</h2>
        <div className="md:col-span-2">{F({ k: "title", label: "Title", required: true })}</div>
        {S({ k: "activity", label: "Activity", options: [["HIKE", "Day hike"], ["BOOTCAMP", "Bootcamp"], ["RUN_CHALLENGE", "Virtual run challenge"]] })}
        {S({ k: "difficulty", label: "Difficulty", options: [["EASY", "Easy"], ["MODERATE", "Moderate"], ["DIFFICULT", "Difficult"]] })}
        {S({ k: "zone", label: "Location type", options: [["NEAR_NAIROBI", "Near Nairobi"], ["OUT_OF_NAIROBI", "Out of Nairobi"], ["VIRTUAL", "Virtual"]] })}
        {F({ k: "startsAt", label: "Date & start time (Nairobi time)", type: "datetime-local", required: true })}
        {F({ k: "region", label: "Location", placeholder: "e.g. Ngong Hills, Kajiado", required: true })}
        {F({ k: "meetingPoint", label: "Meeting point", placeholder: "e.g. Forest Station gate", required: true })}
      </section>

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-4">
        <h2 className="text-2xl md:col-span-4">Price, spots &amp; trail stats</h2>
        {F({ k: "priceKes", label: "Price per person (KES)", type: "number", min: 0, inputMode: "numeric", required: true })}
        {F({ k: "capacity", label: "Total spots", type: "number", min: 1, inputMode: "numeric", required: true })}
        {F({ k: "guideRatio", label: "Guide ratio", placeholder: "1 guide : 8 hikers" })}
        {F({ k: "instructor", label: "Instructor", placeholder: "For bootcamps" })}
        {F({ k: "durationHours", label: "Duration (hours)", type: "number", step: "0.5", min: 0 })}
        {F({ k: "distanceKm", label: "Distance (km)", type: "number", step: "0.1", min: 0 })}
        {F({ k: "elevationGainM", label: "Total climb (m)", type: "number", min: 0 })}
        {F({ k: "highestPointM", label: "Highest point (m)", type: "number", min: 0 })}
      </section>

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">Description</h2>
        <div className="md:col-span-2">{F({ k: "summary", label: "One-line summary", maxLength: 280, hint: "Shown on event cards. Max 280 characters." })}</div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="description">Full description</label>
          <textarea id="description" name="description" rows={7} className="field" value={v.description} onChange={set("description")} aria-invalid={!!err.description} />
          <p className="mt-1 text-sm text-moss">Leave a blank line between paragraphs.</p>
          {err.description && <p className="mt-1 text-sm font-semibold text-brown">{err.description}</p>}
        </div>
        <div>
          <label className="label" htmlFor="inclusions">What&apos;s included (one per line)</label>
          <textarea id="inclusions" name="inclusions" rows={5} className="field" value={v.inclusions} onChange={set("inclusions")} placeholder={"KWS park fees\nTransport\nGuides"} />
        </div>
        <div>
          <label className="label" htmlFor="bring">What to bring (one per line)</label>
          <textarea id="bring" name="bring" rows={5} className="field" value={v.bring} onChange={set("bring")} placeholder={"Hiking shoes\n2 litres of water"} />
        </div>
      </section>

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-[260px_1fr]">
        <h2 className="text-2xl md:col-span-2">Cover photo</h2>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border-2 border-night bg-cream">
          {v.coverUrl ? <img src={v.coverUrl} alt="Cover preview" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center p-4 text-center text-sm text-moss">No photo: a branded illustration is shown instead</div>}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <p className="text-sm text-moss">Use a real photo from a past Peak Pals event (no AI-generated images). JPG, PNG or WebP up to 25 MB. It&apos;s resized automatically.</p>
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-ghost cursor-pointer"><Icon name="upload" className="size-5" />{uploading ? "Uploading…" : v.coverUrl ? "Replace photo" : "Upload photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            {v.coverUrl && <button type="button" className="btn btn-ghost text-brown" onClick={() => setV({ ...v, coverMediaId: "", coverUrl: "" })}>Remove</button>}
          </div>
          {upErr && <p className="text-sm font-semibold text-brown">{upErr}</p>}
        </div>
      </section>

      <section className="sticker flex flex-col gap-4 bg-white p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {F({ k: "slug", label: "Web address (optional)", hint: "Leave blank to create it from the title.", placeholder: "ngong-hills-ridge-walk" })}
        </div>
        <label className="flex items-center gap-3 font-semibold">
          <input type="checkbox" name="published" className="size-5 accent-forest" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />
          Published (visible on the website and open for booking)
        </label>
      </section>

      {state.message && !state.ok && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={pending || uploading}>{pending ? "Saving…" : v.id ? "Save changes" : "Create event"}</button>
        <Link href="/admin/events" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
