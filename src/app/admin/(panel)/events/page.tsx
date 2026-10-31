import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ACTIVITY, fmtDate, fmtTime, kes } from "@/lib/format";
import { DifficultyBadge } from "@/components/Difficulty";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Events" };

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; show?: string }> }) {
  const sp = await searchParams;
  const showPast = sp.show === "past";
  const { events, bookings } = schema;
  const rows = await db.select({
    e: events,
    booked: sql<number>`coalesce((select sum(${bookings.participantCount}) from ${bookings} where ${bookings.eventId} = ${events.id} and ${bookings.status} <> 'CANCELLED'),0)::int`,
  }).from(events)
    .where(showPast ? sql`${events.startsAt} < now() - interval '6 hours'` : sql`${events.startsAt} >= now() - interval '6 hours'`)
    .orderBy(showPast ? desc(events.startsAt) : events.startsAt);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Calendar</p><h1 className="mt-1 text-4xl">Events</h1></div>
        <Link href="/admin/events/new" className="btn btn-gold"><Icon name="plus" className="size-5" />New event</Link>
      </div>
      {sp.saved && <p role="status" className="rounded-2xl border-2 border-olive bg-olive/15 p-3 font-semibold">Saved “{sp.saved}”.</p>}
      {sp.deleted && <p role="status" className="rounded-2xl border-2 border-brown/40 bg-brown/10 p-3 font-semibold">Event deleted.</p>}
      <nav className="flex gap-2">
        <Link href="/admin/events" className="chip" aria-current={!showPast ? "true" : undefined}>Upcoming</Link>
        <Link href="/admin/events?show=past" className="chip" aria-current={showPast ? "true" : undefined}>Past</Link>
      </nav>
      <div className="sticker overflow-x-auto bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-cream font-display text-forest"><tr><th className="px-5 py-3">Event</th><th className="px-3 py-3">When</th><th className="px-3 py-3">Level</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Booked</th><th className="px-3 py-3">Status</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map(({ e, booked }) => (
              <tr key={e.id} className="border-t border-night/10 align-middle">
                <td className="px-5 py-3"><p className="font-semibold">{e.title}</p><p className="text-moss">{ACTIVITY[e.activity].label} · {e.region}</p></td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtDate(e.startsAt, { day: "numeric", month: "short", year: "numeric" })}<br /><span className="text-moss">{fmtTime(e.startsAt)}</span></td>
                <td className="px-3 py-3"><DifficultyBadge level={e.difficulty} size="sm" /></td>
                <td className="px-3 py-3 whitespace-nowrap">{kes(e.priceKes)}</td>
                <td className="px-3 py-3"><Link className="font-semibold underline-offset-2 hover:underline" href={`/admin/bookings?event=${e.id}`}>{booked}/{e.capacity}</Link></td>
                <td className="px-3 py-3">{e.published ? <span className="rounded-full bg-olive/20 px-2.5 py-1 font-bold text-forest">Live</span> : <span className="rounded-full bg-night/10 px-2.5 py-1 font-bold">Draft</span>}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/events/${e.id}`} className="font-display font-bold text-forest hover:text-orange">Edit</Link>
                  <Link href={`/events/${e.slug}`} target="_blank" className="ml-4 font-display font-bold text-forest hover:text-orange">View</Link>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-moss">No {showPast ? "past" : "upcoming"} events.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
