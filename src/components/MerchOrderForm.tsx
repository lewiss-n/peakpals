"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createMerchOrder, type FormState } from "@/lib/actions/public";
import { kes } from "@/lib/format";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

const DELIVERY = [
  { v: "PICKUP_EVENT", t: "Collect at a Peak Pals event", d: "Free. Pick it up from the crew at your next hike or bootcamp." },
  { v: "DELIVERY_NAIROBI", t: "Delivery within Nairobi", d: "Rider delivery. The fee depends on your area and is confirmed by phone." },
  { v: "COURIER", t: "Courier outside Nairobi", d: "Sent by courier. The fee is confirmed by phone." },
];

export function MerchOrderForm({ productId, price, sizes, colors, name: productName }: { productId: string; price: number; sizes: string[]; colors: string[]; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createMerchOrder, { ok: false });
  const [v, setV] = useState({ size: "", color: colors.length === 1 ? colors[0] : "", quantity: 1, name: "", email: "", phone: "", delivery: "PICKUP_EVENT", address: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const err = state.errors ?? {};
  const E = (k: string) => err[k] && <p className="mt-1 text-sm font-semibold text-brown">{err[k]}</p>;

  if (state.ok && state.data) {
    const d = state.data as { reference: string; total: number; quantity: number };
    return (
      <div className="text-center" role="status">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-night bg-olive text-white"><Icon name="check" className="size-9" strokeWidth={3} /></div>
        <h2 className="mt-4 text-3xl">Order received!</h2>
        <p className="mt-2">{d.quantity} × <b>{productName}</b></p>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-night/30 bg-cream p-4 text-left">
          <p className="font-display text-sm font-bold text-moss">Your order reference</p>
          <p className="font-display text-3xl font-bold tracking-wider text-forest">{d.reference}</p>
          <p className="mt-3 text-sm">To confirm your order, pay <b>{kes(d.total)}</b>{v.delivery !== "PICKUP_EVENT" ? " plus the delivery fee we confirm with you" : ""} via {site.payment.method} <b>{site.payment.paybill}</b>, using {site.payment.account} as the account number.</p>
        </div>
        <p className="hand mt-4 text-2xl text-brown">Wear it to the summit!</p>
        <Link href="/shop" className="btn btn-ghost mt-4">Back to the shop</Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {sizes.length > 0 && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <label key={s} className="chip min-w-12 cursor-pointer justify-center" data-active={v.size === s}>
                <input type="radio" name="size" value={s} className="sr-only" checked={v.size === s} onChange={() => setV({ ...v, size: s })} />{s}
              </label>
            ))}
          </div>
          {E("size")}
        </fieldset>
      )}
      {colors.length > 0 && (
        <fieldset>
          <legend className="label">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <label key={c} className="chip cursor-pointer" data-active={v.color === c}>
                <input type="radio" name="color" value={c} className="sr-only" checked={v.color === c} onChange={() => setV({ ...v, color: c })} />{c}
              </label>
            ))}
          </div>
          {E("color")}
        </fieldset>
      )}
      <div>
        <span className="label" id="qty-label">Quantity</span>
        <div className="inline-flex items-center gap-2" role="group" aria-labelledby="qty-label">
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border-2 border-night bg-paper disabled:opacity-40" onClick={() => setV({ ...v, quantity: Math.max(1, v.quantity - 1) })} disabled={v.quantity <= 1} aria-label="One fewer"><Icon name="minus" className="size-4" /></button>
          <output className="w-10 text-center font-display text-2xl font-bold" aria-live="polite">{v.quantity}</output>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border-2 border-night bg-paper disabled:opacity-40" onClick={() => setV({ ...v, quantity: Math.min(20, v.quantity + 1) })} disabled={v.quantity >= 20} aria-label="One more"><Icon name="plus" className="size-4" /></button>
          <input type="hidden" name="quantity" value={v.quantity} />
        </div>
        {E("quantity")}
      </div>
      <div>
        <label className="label" htmlFor="m-name">Your name</label>
        <input id="m-name" name="name" className="field" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        {E("name")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="m-email">Email</label><input id="m-email" name="email" type="email" className="field" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />{E("email")}</div>
        <div><label className="label" htmlFor="m-phone">Phone (M-Pesa)</label><input id="m-phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="07xx xxx xxx" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />{E("phone")}</div>
      </div>
      <fieldset>
        <legend className="label">How would you like to get it?</legend>
        <div className="flex flex-col gap-2">
          {DELIVERY.map((o) => (
            <label key={o.v} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-3 ${v.delivery === o.v ? "border-forest bg-cream" : "border-night/15 bg-white"}`}>
              <input type="radio" name="delivery" value={o.v} className="mt-1 size-5 accent-forest" checked={v.delivery === o.v} onChange={() => setV({ ...v, delivery: o.v })} />
              <span><span className="block font-display font-bold text-forest">{o.t}</span><span className="text-sm text-moss">{o.d}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      {v.delivery !== "PICKUP_EVENT" && (
        <div><label className="label" htmlFor="m-address">Delivery address or area</label><textarea id="m-address" name="address" rows={2} className="field" autoComplete="street-address" value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />{E("address")}</div>
      )}
      <div><label className="label" htmlFor="m-notes">Notes <span className="font-normal text-moss">(optional)</span></label><input id="m-notes" name="notes" className="field" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></div>
      <label className="flex gap-3 text-sm">
        <input type="checkbox" name="dataConsent" className="mt-0.5 size-5 shrink-0 accent-forest" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree to Peak Pals using these details to process my order, as described in the <Link href="/privacy" className="underline" target="_blank">privacy policy</Link>.</span>
      </label>
      {E("dataConsent")}
      {state.message && !state.ok && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}
      <div className="flex items-center justify-between gap-3 border-t-2 border-night pt-4">
        <div><p className="text-sm text-moss">Total</p><p className="font-display text-2xl font-bold text-forest">{kes(price * v.quantity)}</p></div>
        <button className="btn btn-primary" disabled={pending}>{pending ? "Placing order…" : "Place order"}</button>
      </div>
    </form>
  );
}
