import Link from "next/link";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setBookingStatus } from "@/lib/actions/admin";
import { fmtDate, kes } from "@/lib/format";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Bookings" };

const STATUS = { PENDING: "bg-gold/30 text-night", CONFIRMED: "bg-olive/25 text-forest", CANCELLED: "bg-night/10 text-moss line-through" } as const;

export default async function Bookings({ searchParams }: { searchParams: Promise<{ event?: string; status?: string; q?: string }> }) {
  const sp = await searchParams;
  const { bookings, events } = schema;
  const conds: SQL[] = [];
  if (sp.event && /^[0-9a-f-]{36}$/.test(sp.event)) conds.push(eq(bookings.eventId, sp.event));
  if (sp.status && sp.status in STATUS) conds.push(eq(bookings.status, sp.status as "PENDING"));
  if (sp.q?.trim()) { const q = `%${sp.q.trim().slice(0, 60)}%`; conds.push(or(ilike(bookings.leadName, q), ilike(bookings.email, q), ilike(bookings.phone, q), ilike(bookings.reference, q))!); }
  const rows = await db.select({ b: bookings, title: events.title, startsAt: events.startsAt }).from(bookings)
    .innerJoin(events, eq(events.id, bookings.eventId)).where(conds.length ? and(...conds) : undefined).orderBy(desc(bookings.createdAt)).limit(300);
  const evs = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt }).from(events).where(sql`${events.startsAt} >= now() - interval '60 days'`).orderBy(events.startsAt);
  const qs = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(Object.entries({ event: sp.event, status: sp.status, q: sp.q, ...o }).filter(([, v]) => v) as [string, string][]); return p.toString() ? `?${p}` : ""; };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Who&apos;s coming</p><h1 className="mt-1 text-4xl">Bookings</h1></div>
        <a href={`/api/admin/export?type=bookings${sp.event ? `&eventId=${sp.event}` : ""}`} className="btn btn-ghost"><Icon name="upload" className="size-5 rotate-180" />Export CSV</a>
      </div>
      <form className="sticker flex flex-wrap items-end gap-3 bg-white p-4">
        <div className="min-w-56 flex-1"><label className="label" htmlFor="event">Event</label>
          <select id="event" name="event" defaultValue={sp.event ?? ""} className="field"><option value="">All events</option>{evs.map((e) => <option key={e.id} value={e.id}>{fmtDate(e.startsAt, { day: "numeric", month: "short" })} · {e.title}</option>)}</select></div>
        <div><label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className="field"><option value="">Any</option><option value="PENDING">Awaiting payment</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option></select></div>
        <div className="min-w-48 flex-1"><label className="label" htmlFor="q">Search</label><input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Name, email, phone or reference" className="field" /></div>
        <button className="btn btn-primary">Filter</button>
        {(sp.event || sp.status || sp.q) && <Link href="/admin/bookings" className="btn btn-ghost">Clear</Link>}
      </form>
      <p className="text-sm text-moss">{rows.length} booking{rows.length === 1 ? "" : "s"} · {rows.filter((r) => r.b.status !== "CANCELLED").reduce((a, r) => a + r.b.participantCount, 0)} participants</p>
      <ul className="flex flex-col gap-4">
        {rows.map(({ b, title, startsAt }) => (
          <li key={b.id} className="sticker bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-moss">{b.reference} · booked {fmtDate(b.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                <p className="mt-1 font-display text-xl font-bold text-forest">{b.leadName} <span className="font-sans text-base font-semibold text-night">· {b.participantCount} {b.participantCount === 1 ? "person" : "people"} · {kes(b.totalKes)}</span></p>
                <p className="text-sm"><Link href={qs({ event: b.eventId })} className="font-semibold hover:underline">{title}</Link> · {fmtDate(startsAt, { day: "numeric", month: "short" })}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 text-sm"><a className="underline" href={`mailto:${b.email}`}>{b.email}</a><a className="underline" href={`tel:${b.phone}`}>{b.phone}</a></p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 font-display text-sm font-bold ${STATUS[b.status]}`}>{b.status === "PENDING" ? "Awaiting payment" : b.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span>
                <div className="flex gap-2">
                  {b.status !== "CONFIRMED" && <form action={setBookingStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="CONFIRMED" /><button className="btn btn-primary !min-h-9 !px-4 !py-1 text-sm">Mark paid</button></form>}
                  {b.status !== "CANCELLED" && <form action={setBookingStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="CANCELLED" /><button className="btn btn-ghost !min-h-9 !px-4 !py-1 text-sm">Cancel</button></form>}
                  {b.status === "CANCELLED" && <form action={setBookingStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="PENDING" /><button className="btn btn-ghost !min-h-9 !px-4 !py-1 text-sm">Restore</button></form>}
                </div>
              </div>
            </div>
            <details className="mt-3 border-t border-night/10 pt-3 text-sm">
              <summary className="cursor-pointer font-display font-bold text-forest">Participants &amp; consents</summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <ul className="space-y-1">{b.participants.map((p, i) => <li key={i}>{p.name} <span className="text-moss">({p.age}{p.age < 18 ? ", minor" : ""})</span></li>)}</ul>
                <ul className="space-y-1">
                  <li>Photo consent: <b>{b.photoConsent ? "Yes" : "No"}</b></li>
                  <li>Data &amp; terms accepted: <b>{b.dataConsent && b.termsAccepted ? "Yes" : "No"}</b></li>
                  {b.hasMinors && <li>Guardian: <b>{b.guardianName}</b> ({b.guardianPhone}), consent <b>{b.guardianConsent ? "given" : "missing"}</b></li>}
                  {b.notes && <li>Notes: {b.notes}</li>}
                </ul>
              </div>
            </details>
          </li>
        ))}
        {!rows.length && <li className="sticker bg-white p-10 text-center text-moss">No bookings match.</li>}
      </ul>
    </div>
  );
}
