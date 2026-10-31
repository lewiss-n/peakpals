"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/public";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { ok: false });
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {state.message && <p role="alert" className="rounded-2xl bg-brown/10 p-3 font-semibold text-brown">{state.message}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
