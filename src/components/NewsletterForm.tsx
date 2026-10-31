"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/lib/actions/public";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, { ok: false });
  return (
    <form action={action} className="w-full max-w-md">
      <label htmlFor="nl-email" className={`mb-2 block font-display text-lg font-bold ${dark ? "text-cream" : "text-forest"}`}>New adventures, straight to your inbox</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="field flex-1" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button className="btn btn-gold" disabled={pending}>{pending ? "Joining…" : "Join the crew"}</button>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-6 text-sm font-semibold ${dark ? "text-sand" : state.ok ? "text-forest" : "text-brown"}`}>{state.message}</p>
    </form>
  );
}
