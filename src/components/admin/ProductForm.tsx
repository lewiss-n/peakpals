"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/public";
import { Icon } from "../Icon";
import { ProductArt } from "../ProductArt";
import { uploadMedia } from "@/lib/upload-client";

type Img = { id: string; url: string };
type V = {
  id?: string; name: string; slug: string; category: string; art: string; summary: string; description: string; priceKes: string;
  sizes: string; colors: string; sortOrder: string; inStock: boolean; featured: boolean; published: boolean; images: Img[];
};

const EMPTY: V = { name: "", slug: "", category: "Apparel", art: "tee", summary: "", description: "", priceKes: "", sizes: "", colors: "", sortOrder: "0", inStock: true, featured: false, published: true, images: [] };
const ARTS = [["tee", "T-shirt"], ["hoodie", "Hoodie"], ["cap", "Cap"], ["bottle", "Bottle"], ["buff", "Buff"], ["tote", "Tote bag"]] as const;

export function ProductForm({ initial }: { initial?: V }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, { ok: false });
  const [v, setV] = useState<V>(initial ?? EMPTY);
  const [busy, setBusy] = useState(0);
  const [upErr, setUpErr] = useState("");
  const err = state.errors ?? {};
  const set = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  async function upload(files: FileList) {
    setUpErr("");
    for (const f of Array.from(files)) {
      setBusy((b) => b + 1);
      try {
        const r = await uploadMedia(f);
        setV((x) => ({ ...x, images: [...x.images, { id: r.id, url: r.url }] }));
      } catch (e) { setUpErr(`${f.name}: ${e instanceof Error ? e.message : "upload failed"}`); }
      setBusy((b) => b - 1);
    }
  }
  const move = (i: number, d: number) => setV((x) => { const a = [...x.images]; const j = i + d; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, images: a }; });
  const sizePreset = (s: string) => setV({ ...v, sizes: s });

  const field = (k: keyof V, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} name={k} className="field" value={String(v[k])} onChange={set(k)} aria-invalid={!!err[k]} {...props} />
      {hint && !err[k] && <p className="mt-1 text-sm text-moss">{hint}</p>}
      {err[k] && <p className="mt-1 text-sm font-semibold text-brown">{err[k]}</p>}
    </div>
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-6" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      {v.images.map((im) => <input key={im.id} type="hidden" name="images" value={im.id} />)}

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">The item</h2>
        <div className="md:col-span-2">{field("name", "Product name", { placeholder: "e.g. Conquer Your Peak Tee" })}</div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="field" value={v.category} onChange={set("category")}>
            {["Apparel", "Headwear", "Gear", "Accessories"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {field("priceKes", "Price (KES)", { type: "number", min: 0, inputMode: "numeric" })}
        <div className="md:col-span-2">{field("summary", "Short summary", { maxLength: 200 }, "Shown on the product card. Max 200 characters.")}</div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={5} className="field" value={v.description} onChange={set("description")} placeholder="Material, fit, care instructions…" />
        </div>
      </section>

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">Options</h2>
        <div>
          {field("sizes", "Sizes (comma separated)", { placeholder: "S, M, L, XL" }, "Leave blank for one-size items.")}
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <button type="button" className="chip !min-h-9 !py-1" onClick={() => sizePreset("S, M, L, XL, XXL")}>Clothing sizes</button>
            <button type="button" className="chip !min-h-9 !py-1" onClick={() => sizePreset("")}>One size</button>
          </div>
        </div>
        {field("colors", "Colours (comma separated)", { placeholder: "Forest, Cream" }, "Leave blank if there's only one colour.")}
        <div className="md:col-span-2 flex flex-col gap-3">
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" name="inStock" className="size-5 accent-forest" checked={v.inStock} onChange={(e) => setV({ ...v, inStock: e.target.checked })} />In stock (customers can order it)</label>
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" name="featured" className="size-5 accent-forest" checked={v.featured} onChange={(e) => setV({ ...v, featured: e.target.checked })} />Featured (shown first and on the home page)</label>
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" name="published" className="size-5 accent-forest" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />Visible in the shop</label>
        </div>
      </section>

      <section className="sticker flex flex-col gap-5 bg-white p-6">
        <h2 className="text-2xl">Photos</h2>
        <p className="text-sm text-moss">Upload real photos of the item (JPG, PNG or WebP, up to 25 MB each). The first photo is the main one. Without photos, the shop shows a branded illustration instead:</p>
        {!v.images.length && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-36 overflow-hidden rounded-2xl border-2 border-night"><ProductArt art={v.art} className="block w-full" /></div>
            <div>
              <label className="label" htmlFor="art">Illustration style</label>
              <select id="art" name="art" className="field" value={v.art} onChange={set("art")}>{ARTS.map(([a, l]) => <option key={a} value={a}>{l}</option>)}</select>
            </div>
          </div>
        )}
        {v.images.length > 0 && <input type="hidden" name="art" value={v.art} />}
        {v.images.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {v.images.map((im, i) => (
              <li key={im.id} className="w-40 overflow-hidden rounded-2xl border-2 border-night bg-cream">
                <div className="relative aspect-square">
                  <img src={im.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 font-display text-xs font-bold">Main</span>}
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex">
                    <button type="button" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}><Icon name="arrow" className="size-4 rotate-180" /></button>
                    <button type="button" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === v.images.length - 1} aria-label={`Move photo ${i + 1} later`}><Icon name="arrow" className="size-4" /></button>
                  </div>
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-full text-brown hover:bg-white" onClick={() => setV({ ...v, images: v.images.filter((x) => x.id !== im.id) })} aria-label={`Remove photo ${i + 1}`}><Icon name="trash" className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn btn-ghost cursor-pointer"><Icon name="upload" className="size-5" />{busy ? `Uploading ${busy}…` : "Upload photos"}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy > 0} onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
          </label>
          {upErr && <p className="text-sm font-semibold text-brown">{upErr}</p>}
        </div>
      </section>

      <section className="sticker grid gap-5 bg-white p-6 md:grid-cols-2">
        {field("slug", "Web address (optional)", { placeholder: "conquer-your-peak-tee" }, "Leave blank to create it from the name.")}
        {field("sortOrder", "Display order", { type: "number", min: 0 }, "Lower numbers show first.")}
      </section>

      {state.message && !state.ok && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={pending || busy > 0}>{pending ? "Saving…" : v.id ? "Save changes" : "Add to shop"}</button>
        <Link href="/admin/merch" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
