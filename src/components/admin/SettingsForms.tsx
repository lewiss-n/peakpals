"use client";

import { useActionState } from "react";
import { changePassword, createAdminUser } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/public";

function Msg({ s }: { s: FormState }) {
  return s.message ? <p role="status" className={`rounded-2xl p-3 font-semibold ${s.ok ? "bg-olive/15" : "bg-brown/10 text-brown"}`}>{s.message}</p> : null;
}

export function SettingsForms() {
  const [ps, pAction, pPending] = useActionState<FormState, FormData>(changePassword, { ok: false });
  const [us, uAction, uPending] = useActionState<FormState, FormData>(createAdminUser, { ok: false });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={pAction} className="sticker flex flex-col gap-4 bg-white p-6">
        <h2 className="text-2xl">Change your password</h2>
        <div><label className="label" htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" className="field" required /></div>
        <div><label className="label" htmlFor="next">New password (10+ characters)</label><input id="next" name="next" type="password" autoComplete="new-password" minLength={10} className="field" required /></div>
        <div><label className="label" htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" className="field" required /></div>
        <Msg s={ps} />
        <button className="btn btn-primary self-start" disabled={pPending}>Update password</button>
      </form>
      <form action={uAction} className="sticker flex flex-col gap-4 bg-white p-6">
        <h2 className="text-2xl">Add a team member</h2>
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" className="field" required /></div>
        <div><label className="label" htmlFor="nemail">Email</label><input id="nemail" name="email" type="email" className="field" required /></div>
        <div><label className="label" htmlFor="npass">Temporary password (10+ characters)</label><input id="npass" name="password" type="password" autoComplete="new-password" minLength={10} className="field" required /></div>
        <Msg s={us} />
        <button className="btn btn-primary self-start" disabled={uPending}>Create admin</button>
      </form>
    </div>
  );
}
