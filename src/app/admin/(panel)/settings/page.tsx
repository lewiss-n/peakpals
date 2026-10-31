import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { SettingsForms } from "@/components/admin/SettingsForms";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const users = await db.select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, last: schema.users.lastLoginAt }).from(schema.users).orderBy(asc(schema.users.createdAt));
  return (
    <div className="flex flex-col gap-6">
      <div><p className="kicker">Your account</p><h1 className="mt-1 text-4xl">Settings</h1></div>
      <section className="sticker bg-white p-6">
        <h2 className="text-2xl">Admin team</h2>
        <ul className="mt-3 divide-y divide-night/10">
          {users.map((u) => <li key={u.id} className="flex flex-wrap justify-between gap-2 py-2"><span><b>{u.name}</b> · {u.email}</span><span className="text-sm text-moss">{u.last ? `Last sign-in ${fmtDate(u.last, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : "Never signed in"}</span></li>)}
        </ul>
      </section>
      <SettingsForms />
    </div>
  );
}
