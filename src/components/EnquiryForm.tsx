"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createEnquiry, type FormState } from "@/lib/actions/public";
import { Icon } from "./Icon";

const INTERESTS = ["Hiking", "Bootcamp", "Virtual challenge", "Not sure yet"];

export function EnquiryForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createEnquiry, { ok: false });
  const [v, setV] = useState({ organisation: "", contactName: "", email: "", phone: "", groupSize: "", preferredDate: "", message: "" });
  const [interests, setInterests] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const err = state.errors ?? {};
  if (state.ok) {
    return (
      <div className="mt-6 text-center" role="status">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-night bg-olive text-white"><Icon name="check" className="size-9" strokeWidth={3} /></div>
        <p className="mt-4 font-display text-2xl font-bold text-forest">Enquiry received!</p>
        <p className="mt-2">{state.message}</p>
      </div>
    );
  }
  const input = (k: keyof typeof v, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} name={k} className="field" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} {...props} />
      {err[k] && <p className="mt-1 text-sm font-semibold text-brown">{err[k]}</p>}
    </div>
  );
  return (
    <form action={action} className="mt-6 flex flex-col gap-4" noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {input("organisation", "Company or group", { autoComplete: "organization" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {input("contactName", "Your name", { autoComplete: "name" })}
        {input("phone", "Phone", { type: "tel", autoComplete: "tel" })}
      </div>
      {input("email", "Email", { type: "email", autoComplete: "email" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {input("groupSize", "Group size", { type: "number", min: 2, inputMode: "numeric" })}
        {input("preferredDate", "Preferred date or month", { placeholder: "e.g. mid-March" })}
      </div>
      <fieldset>
        <legend className="label">Interested in</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = interests.includes(i);
            return (
              <label key={i} className="chip cursor-pointer" data-active={on}>
                <input type="checkbox" name="interests" value={i} className="sr-only" checked={on} onChange={() => setInterests(on ? interests.filter((x) => x !== i) : [...interests, i])} />
                {on && <Icon name="check" className="size-4" strokeWidth={3} />}{i}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="message">Tell us more <span className="font-normal text-moss">(optional)</span></label>
        <textarea id="message" name="message" rows={4} className="field" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} placeholder="Goals for the day, fitness levels, location ideas…" />
      </div>
      <label className="flex gap-3 text-sm">
        <input type="checkbox" name="dataConsent" className="mt-0.5 size-5 shrink-0 accent-forest" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree to Peak Pals using these details to respond to my enquiry, as described in the <Link href="/privacy" className="underline">privacy policy</Link>.</span>
      </label>
      {err.dataConsent && <p className="-mt-2 text-sm font-semibold text-brown">{err.dataConsent}</p>}
      {state.message && !state.ok && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}
