import Link from "next/link";
import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/queries";
import { EventCard } from "@/components/EventCard";
import { Icon } from "@/components/Icon";
import { Peaks } from "@/components/Difficulty";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Upcoming events", description: "Day hikes, bootcamps and virtual run challenges with Peak Pals Adventures." };

type SP = Promise<Record<string, string | string[] | undefined>>;

const FILTERS = {
  activity: [["", "All"], ["HIKE", "Hikes"], ["BOOTCAMP", "Bootcamps"], ["RUN_CHALLENGE", "Virtual runs"]],
  difficulty: [["", "Any level"], ["EASY", "Easy"], ["MODERATE", "Moderate"], ["DIFFICULT", "Difficult"]],
  zone: [["", "Anywhere"], ["NEAR_NAIROBI", "Near Nairobi"], ["OUT_OF_NAIROBI", "Out of Nairobi"], ["VIRTUAL", "Virtual"]],
} as const;

export default async function EventsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const f = { activity: get("activity"), difficulty: get("difficulty"), zone: get("zone"), q: get("q") };
  const rows = await getUpcomingEvents(f);
  const href = (k: keyof typeof f, v: string) => {
    const p = new URLSearchParams(Object.entries({ ...f, [k]: v }).filter(([, x]) => x) as [string, string][]);
    const s = p.toString();
    return s ? `/events?${s}` : "/events";
  };
  const any = f.activity || f.difficulty || f.zone || f.q;

  return (
    <div className="topo">
      <section className="wrap pb-6 pt-14">
        <p className="kicker">Book your next adventure</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Upcoming events</h1>
        <p className="mt-3 max-w-2xl text-lg text-moss">Every event lists its level, distance, meeting point and exactly what&apos;s included, so you know what you&apos;re signing up for.</p>
      </section>

      <section className="wrap">
        <div className="sticker flex flex-col gap-5 bg-paper p-5 sm:p-6">
          <form action="/events" className="flex flex-col gap-2 sm:flex-row" role="search">
            {f.activity && <input type="hidden" name="activity" value={f.activity} />}
            {f.difficulty && <input type="hidden" name="difficulty" value={f.difficulty} />}
            {f.zone && <input type="hidden" name="zone" value={f.zone} />}
            <label htmlFor="q" className="sr-only">Search events</label>
            <div className="relative flex-1">
              <Icon name="summit" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-orange" />
              <input id="q" name="q" defaultValue={f.q} placeholder="Search trails, places, activities…" className="field !pl-12" />
            </div>
            <button className="btn btn-primary">Search</button>
          </form>
          {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
            <div key={k} className="flex flex-wrap items-center gap-2" role="group" aria-label={k}>
              <span className="w-24 shrink-0 font-display text-sm font-bold capitalize text-moss">{k === "zone" ? "Where" : k}</span>
              {FILTERS[k].map(([v, label]) => (
                <Link key={v} href={href(k, v)} className="chip" aria-current={f[k] === v ? "true" : undefined} scroll={false}>
                  {k === "difficulty" && v && <Peaks n={v === "EASY" ? 1 : v === "MODERATE" ? 2 : 3} />}
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="wrap py-10">
        <p className="hand mb-6 text-3xl text-brown" aria-live="polite">{rows.length === 1 ? "1 adventure on the calendar" : `${rows.length} adventures on the calendar`}</p>
        {rows.length ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, i) => <EventCard key={r.event.id} row={r} index={i} />)}
          </div>
        ) : (
          <div className="sticker bg-cream p-10 text-center">
            <p className="font-display text-2xl font-bold text-forest">No events match those filters yet.</p>
            <p className="mt-2 text-moss">Try a different level or location, or check back soon. New dates are added every week.</p>
            {any && <Link href="/events" className="btn btn-primary mt-6">Show all events</Link>}
          </div>
        )}
      </section>
    </div>
  );
}
