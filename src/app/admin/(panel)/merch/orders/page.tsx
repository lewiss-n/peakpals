import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setMerchOrderStatus } from "@/lib/actions/admin";
import { fmtDate, kes } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { MerchTabs } from "@/components/admin/MerchTabs";

export const metadata = { title: "Merch orders" };

const LABEL = { PENDING: "Awaiting payment", PAID: "Paid", FULFILLED: "Delivered", CANCELLED: "Cancelled" } as const;
const TONE = { PENDING: "bg-gold/30", PAID: "bg-olive/25 text-forest", FULFILLED: "bg-forest text-cream", CANCELLED: "bg-night/10 text-moss line-through" } as const;
const DELIVERY: Record<string, string> = { PICKUP_EVENT: "Collect at event", DELIVERY_NAIROBI: "Nairobi delivery", COURIER: "Courier" };
const NEXT: Record<string, (keyof typeof LABEL)[]> = { PENDING: ["PAID", "CANCELLED"], PAID: ["FULFILLED", "CANCELLED"], FULFILLED: [], CANCELLED: ["PENDING"] };
const ACTION: Record<string, string> = { PAID: "Mark paid", FULFILLED: "Mark delivered", CANCELLED: "Cancel", PENDING: "Restore" };

export default async function MerchOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const { merchOrders } = schema;
  const st = sp.status && sp.status in LABEL ? (sp.status as keyof typeof LABEL) : null;
  const rows = await db.select().from(merchOrders).where(st ? eq(merchOrders.status, st) : undefined).orderBy(desc(merchOrders.createdAt)).limit(300);
  const [{ pending }] = await db.select({ pending: sql<number>`count(*)::int` }).from(merchOrders).where(eq(merchOrders.status, "PENDING"));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">The trail shop</p><h1 className="mt-1 text-4xl">Merch orders</h1></div>
        <a href="/api/admin/export?type=merch" className="btn btn-ghost"><Icon name="upload" className="size-5 rotate-180" />Export CSV</a>
      </div>
      <MerchTabs active="orders" pending={pending} />
      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filter by status">
        <a href="/admin/merch/orders" className="chip" aria-current={!st ? "true" : undefined}>All</a>
        {(Object.keys(LABEL) as (keyof typeof LABEL)[]).map((k) => <a key={k} href={`/admin/merch/orders?status=${k}`} className="chip" aria-current={st === k ? "true" : undefined}>{LABEL[k]}</a>)}
      </nav>
      <ul className="flex flex-col gap-4">
        {rows.map((o) => (
          <li key={o.id} className="sticker bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-moss">{o.reference} · {fmtDate(o.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                <p className="mt-1 font-display text-xl font-bold text-forest">{o.quantity} × {o.productName}{o.size ? ` · ${o.size}` : ""}{o.color ? ` · ${o.color}` : ""}</p>
                <p className="font-semibold">{kes(o.totalKes)} <span className="font-normal text-moss">· {DELIVERY[o.delivery] ?? o.delivery}</span></p>
                <p className="mt-1 text-sm">{o.name} · <a className="underline" href={`mailto:${o.email}`}>{o.email}</a> · <a className="underline" href={`tel:${o.phone}`}>{o.phone}</a></p>
                {o.address && <p className="text-sm">Deliver to: {o.address}</p>}
                {o.notes && <p className="text-sm text-moss">Notes: {o.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 font-display text-sm font-bold ${TONE[o.status]}`}>{LABEL[o.status]}</span>
                <div className="flex gap-2">
                  {NEXT[o.status].map((s) => (
                    <form key={s} action={setMerchOrderStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={s} />
                      <button className={`btn !min-h-9 !px-4 !py-1 text-sm ${s === "CANCELLED" ? "btn-ghost" : "btn-primary"}`}>{ACTION[s]}</button></form>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!rows.length && <li className="sticker bg-white p-10 text-center text-moss">No orders {st ? "with this status" : "yet"}.</li>}
      </ul>
    </div>
  );
}
