import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { removeSubscriber } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Subscribers" };

export default async function Subscribers() {
  const rows = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt)).limit(2000);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Newsletter</p><h1 className="mt-1 text-4xl">Subscribers ({rows.length})</h1></div>
        <a href="/api/admin/export?type=subscribers" className="btn btn-ghost"><Icon name="upload" className="size-5 rotate-180" />Export CSV</a>
      </div>
      <div className="sticker overflow-x-auto bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-cream font-display text-forest"><tr><th className="px-5 py-3">Email</th><th className="px-3 py-3">Joined</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-night/10">
                <td className="px-5 py-2 font-semibold">{r.email}</td>
                <td className="px-3 py-2">{fmtDate(r.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-2"><div className="flex justify-end"><DeleteButton action={removeSubscriber} id={r.id} label="Remove" confirmText="Remove?" /></div></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={3} className="px-5 py-10 text-center text-moss">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
