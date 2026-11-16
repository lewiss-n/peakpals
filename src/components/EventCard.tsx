import Link from "next/link";
import type { EventRow } from "@/lib/queries";
import { ACTIVITY, ZONE, dayMonth, fmtDate, fmtTime, kes } from "@/lib/format";
import { DifficultyBadge } from "./Difficulty";
import { EventArt } from "./EventArt";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import { SpotsBar } from "./SpotsBar";

export function EventCard({ row, index = 0 }: { row: EventRow; index?: number }) {
  const e = row.event;
  const left = Math.max(0, e.capacity - row.booked);
  const dm = dayMonth(e.startsAt);
  return (
    <article className="sticker sticker-hover group relative flex flex-col overflow-hidden reveal">
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-navy bg-blue">
        {row.coverFile ? (
          <Photo file={row.coverFile} thumb={row.coverThumb} blur={row.coverBlur} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <EventArt difficulty={e.difficulty} activity={e.activity} seed={index} className="size-full transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute left-3 top-3 rounded-2xl border-2 border-navy bg-sky px-3 py-1.5 text-center leading-none shadow-[3px_3px_0_#0E2348]">
          <div className="font-display text-xs font-bold uppercase text-ember">{dm.mon}</div>
          <div className="font-display text-2xl font-bold text-navy">{dm.day}</div>
        </div>
        <span className="absolute right-3 top-3 rounded-full border-2 border-navy bg-paper px-3 py-1 font-display text-xs font-bold text-navy">
          {ACTIVITY[e.activity].label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={e.difficulty} size="sm" />
          <span className="text-sm font-semibold text-slate">{ZONE[e.zone]}</span>
        </div>
        <h3 className="text-2xl">
          <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">{e.title}</Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate"><Icon name="pin" className="size-4 text-orange" />{e.region}</p>
        <p className="line-clamp-2 text-[15px] text-navy/80">{e.summary}</p>
        <dl className="mt-auto grid grid-cols-3 gap-2 border-t-2 border-dashed border-navy/15 pt-3 text-sm">
          <div><dt className="text-xs font-bold text-slate">When</dt><dd className="font-semibold">{fmtDate(e.startsAt, { weekday: "short" })} {fmtTime(e.startsAt)}</dd></div>
          <div><dt className="text-xs font-bold text-slate">{e.distanceKm ? "Distance" : "Length"}</dt><dd className="font-semibold">{e.distanceKm ? `${e.distanceKm} km` : e.durationHours ? `${e.durationHours} h` : "–"}</dd></div>
          <div><dt className="text-xs font-bold text-slate">Price</dt><dd className="font-semibold">{kes(e.priceKes)}</dd></div>
        </dl>
        <SpotsBar left={left} capacity={e.capacity} />
      </div>
    </article>
  );
}
