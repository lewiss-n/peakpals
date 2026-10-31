"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createBooking, type FormState } from "@/lib/actions/public";
import { kes } from "@/lib/format";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

type P = { name: string; age: string };

export function BookingForm({ eventId, price, maxSpots, title }: { eventId: string; price: number; maxSpots: number; title: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createBooking, { ok: false });
  const [lead, setLead] = useState({ leadName: "", email: "", phone: "" });
  const [people, setPeople] = useState<P[]>([{ name: "", age: "" }]);
  const [guardian, setGuardian] = useState({ guardianName: "", guardianPhone: "" });
  const [checks, setChecks] = useState({ guardianConsent: false, photoConsent: false, dataConsent: false, termsAccepted: false });
  const [notes, setNotes] = useState("");
  const minors = people.some((p) => p.age !== "" && Number(p.age) < 18);
  const err = state.errors ?? {};

  if (state.ok && state.data) {
    const d = state.data as { reference: string; total: number; count: number };
    return (
      <div className="mt-5 text-center" role="status">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-night bg-olive text-white"><Icon name="check" className="size-9" strokeWidth={3} /></div>
        <h3 className="mt-4 text-3xl">You&apos;re in!</h3>
        <p className="mt-2">{d.count === 1 ? "1 spot" : `${d.count} spots`} reserved on <b>{title}</b>.</p>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-night/30 bg-cream p-4 text-left">
          <p className="font-display text-sm font-bold text-moss">Your booking reference</p>
          <p className="font-display text-3xl font-bold tracking-wider text-forest">{d.reference}</p>
          <p className="mt-3 text-sm">To confirm your spot, pay <b>{kes(d.total)}</b> via {site.payment.method} <b>{site.payment.paybill}</b>, using {site.payment.account} as the account number. We&apos;ll then send your trail brief.</p>
        </div>
        <p className="hand mt-4 text-2xl text-brown">See you at the trailhead!</p>
        <Link href="/events" className="btn btn-ghost mt-4">Browse more events</Link>
      </div>
    );
  }

  const setP = (i: number, k: keyof P, v: string) => setPeople((ps) => ps.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const fieldErr = (k: string) => err[k] && <p className="mt-1 text-sm font-semibold text-brown" id={`${k}-err`}>{err[k]}</p>;

  return (
    <form action={action} className="mt-5 flex flex-col gap-4" noValidate>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <h3 className="text-2xl">Book your spot</h3>

      <div>
        <label className="label" htmlFor="leadName">Your full name</label>
        <input id="leadName" name="leadName" className="field" autoComplete="name" required value={lead.leadName} onChange={(e) => setLead({ ...lead, leadName: e.target.value })} aria-invalid={!!err.leadName} aria-describedby={err.leadName ? "leadName-err" : undefined} />
        {fieldErr("leadName")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} aria-invalid={!!err.email} aria-describedby={err.email ? "email-err" : undefined} />
          {fieldErr("email")}
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone (M-Pesa)</label>
          <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="07xx xxx xxx" required value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} aria-invalid={!!err.phone} aria-describedby={err.phone ? "phone-err" : undefined} />
          {fieldErr("phone")}
        </div>
      </div>

      <fieldset className="rounded-2xl border-2 border-night/15 p-4">
        <legend className="px-1 font-display text-sm font-bold text-forest">Who&apos;s coming? (ages 13+)</legend>
        <div className="flex flex-col gap-3">
          {people.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <label className="sr-only" htmlFor={`pname-${i}`}>Participant {i + 1} name</label>
                <input id={`pname-${i}`} name="pname" className="field" placeholder={i === 0 ? "Participant 1 (can be you)" : `Participant ${i + 1}`} value={p.name} onChange={(e) => setP(i, "name", e.target.value)} />
                {err[`participants.${i}.name`] && <p className="mt-1 text-sm font-semibold text-brown">{err[`participants.${i}.name`]}</p>}
              </div>
              <div className="w-24">
                <label className="sr-only" htmlFor={`page-${i}`}>Participant {i + 1} age</label>
                <input id={`page-${i}`} name="page" type="number" inputMode="numeric" min={13} max={100} className="field" placeholder="Age" value={p.age} onChange={(e) => setP(i, "age", e.target.value)} />
                {err[`participants.${i}.age`] && <p className="mt-1 text-sm font-semibold text-brown">{err[`participants.${i}.age`]}</p>}
              </div>
              {people.length > 1 && (
                <button type="button" onClick={() => setPeople((ps) => ps.filter((_, j) => j !== i))} className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-night/20 hover:border-brown" aria-label={`Remove participant ${i + 1}`}>
                  <Icon name="x" className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {people.length < maxSpots && (
          <button type="button" onClick={() => setPeople((ps) => [...ps, { name: "", age: "" }])} className="mt-3 inline-flex min-h-11 items-center gap-2 font-display font-bold text-forest hover:text-orange">
            <Icon name="plus" className="size-5" /> Add a participant
          </button>
        )}
      </fieldset>

      {minors && (
        <fieldset className="rounded-2xl border-2 border-gold bg-sand/40 p-4">
          <legend className="px-1 font-display text-sm font-bold text-forest">Parent or guardian (required for under-18s)</legend>
          <div className="flex flex-col gap-3">
            <div>
              <label className="label" htmlFor="guardianName">Guardian&apos;s full name</label>
              <input id="guardianName" name="guardianName" className="field" value={guardian.guardianName} onChange={(e) => setGuardian({ ...guardian, guardianName: e.target.value })} />
              {fieldErr("guardianName")}
            </div>
            <div>
              <label className="label" htmlFor="guardianPhone">Guardian&apos;s phone</label>
              <input id="guardianPhone" name="guardianPhone" type="tel" className="field" value={guardian.guardianPhone} onChange={(e) => setGuardian({ ...guardian, guardianPhone: e.target.value })} />
              {fieldErr("guardianPhone")}
            </div>
            <label className="flex gap-3 text-sm">
              <input type="checkbox" name="guardianConsent" className="mt-0.5 size-5 shrink-0 accent-forest" checked={checks.guardianConsent} onChange={(e) => setChecks({ ...checks, guardianConsent: e.target.checked })} />
              <span>I am the parent or legal guardian of the participant(s) under 18, and I consent to their taking part.</span>
            </label>
            {fieldErr("guardianConsent")}
          </div>
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="notes">Anything we should know? <span className="font-normal text-moss">(optional)</span></label>
        <textarea id="notes" name="notes" rows={2} className="field" placeholder="Medical conditions, dietary needs, pick-up questions…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex gap-3">
          <input type="checkbox" name="photoConsent" className="mt-0.5 size-5 shrink-0 accent-forest" checked={checks.photoConsent} onChange={(e) => setChecks({ ...checks, photoConsent: e.target.checked })} />
          <span>Photo &amp; video consent: Peak Pals may use photos and videos of our group from this event on its website and social media. <span className="text-moss">(optional)</span></span>
        </label>
        <label className="flex gap-3">
          <input type="checkbox" name="dataConsent" className="mt-0.5 size-5 shrink-0 accent-forest" checked={checks.dataConsent} onChange={(e) => setChecks({ ...checks, dataConsent: e.target.checked })} aria-invalid={!!err.dataConsent} />
          <span>I agree to Peak Pals processing these details to manage my booking, as set out in the <Link href="/privacy" className="underline" target="_blank">privacy policy</Link>.</span>
        </label>
        {fieldErr("dataConsent")}
        <label className="flex gap-3">
          <input type="checkbox" name="termsAccepted" className="mt-0.5 size-5 shrink-0 accent-forest" checked={checks.termsAccepted} onChange={(e) => setChecks({ ...checks, termsAccepted: e.target.checked })} aria-invalid={!!err.termsAccepted} />
          <span>I accept the <Link href="/terms" className="underline" target="_blank">terms &amp; conditions</Link>, including the 13+ age requirement.</span>
        </label>
        {fieldErr("termsAccepted")}
      </div>

      {state.message && !state.ok && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}

      <div className="flex items-center justify-between gap-3 border-t-2 border-night pt-4">
        <div>
          <p className="text-sm text-moss">Total for {people.length} {people.length === 1 ? "person" : "people"}</p>
          <p className="font-display text-2xl font-bold text-forest">{kes(price * people.length)}</p>
        </div>
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Reserve spots"}</button>
      </div>
    </form>
  );
}
