/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/queries";
import { ACTIVITY, ZONE, fmtDate, fmtTime, kes } from "@/lib/format";
import { DifficultyBadge } from "@/components/Difficulty";
import { EventArt } from "@/components/EventArt";
import { Icon } from "@/components/Icon";
import { Photo } from "@/components/Photo";
import { SpotsBar } from "@/components/SpotsBar";
import { BookingForm } from "@/components/BookingForm";
import { site } from "@/lib/site";
import { mediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const row = await getEventBySlug((await params).slug);
  if (!row) return { title: "Event not found" };
  return { title: row.event.title, description: row.event.summary, openGraph: row.coverFile ? { images: [mediaUrl(row.coverFile)!] } : undefined };
}

export default async function EventPage({ params }: { params: Params }) {
  const row = await getEventBySlug((await params).slug);
  if (!row) notFound();
  const e = row.event;
  const left = Math.max(0, e.capacity - row.booked);
  const past = new Date(e.startsAt).getTime() < Date.now() - 6 * 3600e3;
  const facts = [
    { icon: "calendar", label: "Date", value: fmtDate(e.startsAt, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
    { icon: "clock", label: "Start time", value: e.activity === "RUN_CHALLENGE" ? "Starts this day" : fmtTime(e.startsAt) },
    e.durationHours && { icon: "clock", label: "Duration", value: e.durationHours >= 48 ? `${Math.round(e.durationHours / 24)} days` : `About ${e.durationHours} hours` },
    e.distanceKm && { icon: "route", label: "Distance", value: `${e.distanceKm} km` },
    e.elevationGainM && { icon: "climb", label: "Total climb", value: `${e.elevationGainM.toLocaleString()} m` },
    e.highestPointM && { icon: "summit", label: "Highest point", value: `${e.highestPointM.toLocaleString()} m` },
    e.guideRatio && { icon: "users", label: "Guides", value: e.guideRatio },
    e.instructor && { icon: "yoga", label: "Instructor", value: e.instructor },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: new Date(e.startsAt).toISOString(),
    eventAttendanceMode: e.zone === "VIRTUAL" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: e.zone === "VIRTUAL" ? { "@type": "VirtualLocation", url: `${site.url}/events/${e.slug}` } : { "@type": "Place", name: e.region, address: e.region },
    description: e.summary, organizer: { "@type": "Organization", name: site.name, url: site.url },
    offers: { "@type": "Offer", price: e.priceKes, priceCurrency: "KES", availability: left > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="relative isolate overflow-hidden border-b-2 border-night bg-night">
        {row.coverFile ? (
          <Photo file={row.coverFile} thumb={row.coverThumb} blur={row.coverBlur} alt="" priority sizes="100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-70" />
        ) : (
          <EventArt difficulty={e.difficulty} activity={e.activity} className="absolute inset-0 -z-10 size-full opacity-60" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/60 to-night/10" />
        <div className="wrap pb-12 pt-20 text-cream sm:pt-28">
          <Link href="/events" className="mb-6 inline-flex items-center gap-2 rounded-full bg-night/50 px-3 py-1 font-display text-sm font-bold text-cream hover:bg-night/70">
            <Icon name="arrow" className="size-4 rotate-180" /> All events
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge level={e.difficulty} />
            <span className="rounded-full border-2 border-night bg-cream px-3 py-1 font-display text-sm font-bold text-night">{ACTIVITY[e.activity].label}</span>
            <span className="rounded-full border-2 border-night bg-paper px-3 py-1 font-display text-sm font-bold text-night">{ZONE[e.zone]}</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl !text-cream sm:text-7xl">{e.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-cream/90"><Icon name="pin" className="size-5 text-gold" />{e.region}</p>
        </div>
      </section>

      <div className="wrap grid gap-10 py-12 lg:grid-cols-[1fr_440px]">
        <div className="min-w-0">
          <p className="hand text-3xl text-brown">{e.summary}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl border-2 border-night/15 bg-white p-4">
                <dt className="flex items-center gap-1.5 text-sm font-bold text-moss"><Icon name={f.icon} className="size-4 text-orange" />{f.label}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-forest">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 space-y-4 text-lg leading-relaxed">
            {e.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {e.inclusions.length > 0 && (
              <div className="sticker bg-cream p-6">
                <h2 className="text-2xl">What&apos;s included</h2>
                <ul className="mt-3 space-y-2">{e.inclusions.map((x) => <li key={x} className="flex gap-2"><Icon name="check" className="mt-1 size-5 shrink-0 text-forest" strokeWidth={2.6} />{x}</li>)}</ul>
              </div>
            )}
            {e.bring.length > 0 && (
              <div className="sticker bg-paper p-6">
                <h2 className="text-2xl">What to bring</h2>
                <ul className="mt-3 space-y-2">{e.bring.map((x) => <li key={x} className="flex gap-2"><Icon name="boot" className="mt-0.5 size-5 shrink-0 text-orange" />{x}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-brown/40 bg-white p-5">
            <h2 className="flex items-center gap-2 text-xl"><Icon name="pin" className="size-5 text-orange" />Meeting point</h2>
            <p className="mt-1 text-lg">{e.meetingPoint}</p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" id="book">
          <div className="sticker overflow-hidden bg-white">
            <div className="flex items-end justify-between gap-4 border-b-2 border-night bg-gold p-5">
              <div>
                <p className="font-display text-sm font-bold text-night/80">Price per person</p>
                <p className="font-display text-4xl font-bold text-night">{kes(e.priceKes)}</p>
              </div>
              <img src="/brand/peak-pals-icon-primary.svg" alt="" className="size-14" />
            </div>
            <div className="p-5">
              <SpotsBar left={left} capacity={e.capacity} />
              {past ? (
                <p className="mt-5 rounded-2xl bg-cream p-4 font-semibold">This event has already happened. Check the <Link className="underline" href="/memories">memories</Link> or browse <Link className="underline" href="/events">upcoming events</Link>.</p>
              ) : left === 0 ? (
                <p className="mt-5 rounded-2xl bg-cream p-4 font-semibold">Fully booked. <a className="underline" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi Peak Pals! Please add me to the waitlist for ${e.title}.`)}`} target="_blank" rel="noopener">Join the waitlist on WhatsApp</a>.</p>
              ) : (
                <BookingForm eventId={e.id} price={e.priceKes} maxSpots={Math.min(10, left)} title={e.title} />
              )}
            </div>
          </div>
        </aside>
      </div>
      {!past && left > 0 && (
        <div className="mobile-book-bar fixed inset-x-0 bottom-0 z-40 border-t-2 border-night bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div><p className="text-xs font-bold text-moss">{left} spots left · per person</p><p className="font-display text-xl font-bold text-forest">{kes(e.priceKes)}</p></div>
            <a href="#book" className="btn btn-gold">Book now</a>
          </div>
        </div>
      )}
    </article>
  );
}
