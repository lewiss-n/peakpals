/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getRecentPhotos, getUpcomingEvents } from "@/lib/queries";
import { EventCard } from "@/components/EventCard";
import { Marquee } from "@/components/Marquee";
import { Icon } from "@/components/Icon";
import { Peaks } from "@/components/Difficulty";
import { Photo } from "@/components/Photo";
import { Ridge } from "@/components/Ridge";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/merch";
import { fmtDate, fmtTime, kes } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVITIES = [
  { icon: "hike", title: "Hiking", color: "bg-forest text-cream", rot: "-rotate-1", body: "Guided day hikes near Nairobi and beyond, from shady forest loops to volcano crater rims.", href: "/events?activity=HIKE" },
  { icon: "yoga", title: "Bootcamps", color: "bg-gold text-night", rot: "rotate-1", body: "Instructor-led Zumba, kata-box, yoga and Pilates sessions, outdoors whenever we can.", href: "/events?activity=BOOTCAMP" },
  { icon: "run", title: "Virtual runs", color: "bg-orange text-night", rot: "-rotate-[0.6deg]", body: "Run or walk challenges you can do from anywhere, with a community cheering you on.", href: "/events?activity=RUN_CHALLENGE" },
];

const LEVELS = [
  { n: 1, name: "Easy", tone: "bg-olive", who: "First-timers and anyone who walks now and then.", what: "Mostly flat trails, 2 to 4 hours, plenty of breaks." },
  { n: 2, name: "Moderate", tone: "bg-gold", who: "People who walk or train regularly.", what: "Some steep climbs, 4 to 6 hours on your feet." },
  { n: 3, name: "Difficult", tone: "bg-brown", who: "Experienced hikers after a real challenge.", what: "Long days, big climbs, loose or muddy ground." },
];

const STEPS = [
  { t: "Pick your adventure", d: "Filter by activity, difficulty and how far from Nairobi you want to go." },
  { t: "Save your spot", d: "Book for yourself or your crew in a minute. You'll get a booking reference instantly." },
  { t: "Get the trail brief", d: "We confirm your payment and send what to bring, where to meet and the weather." },
  { t: "Show up & conquer", d: "Walk it with our guides, then find yourself in the memories album." },
];

const VALUES = [
  { t: "Consistency", s: "Do it your way, as long as you're doing it." },
  { t: "Discipline", s: "Show up always." },
  { t: "Integrity & Accountability", s: "We deliver on our promises." },
  { t: "The Extra Mile", s: "The best experience in everything we do." },
];

export default async function Home() {
  const [events, photos, merch] = await Promise.all([getUpcomingEvents({}, 7), getRecentPhotos(6), getFeaturedProducts(4)]);
  const next = events.find((r) => r.event.capacity - r.booked > 0 && r.event.activity !== "RUN_CHALLENGE") ?? events[0];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b-2 border-night bg-night">
        <img src="/images/trail-companions.webp" alt="Two hikers with backpacks walking a trail towards snowy peaks" className="absolute inset-0 -z-10 size-full animate-kenburns object-cover object-[60%_40%]" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/45 lg:bg-gradient-to-r lg:from-night/85 lg:via-night/45 lg:to-transparent" />
        <div className="wrap grid min-h-[min(86svh,760px)] items-end gap-10 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
          <div className="text-cream">
            <p className="hand mb-2 text-3xl text-sand sm:text-4xl">Hikes · bootcamps · run challenges</p>
            <h1 className="max-w-3xl text-6xl !leading-[0.95] !text-cream sm:text-7xl lg:text-8xl">Conquer your peak.</h1>
            <p className="mt-6 max-w-xl text-lg text-cream/90 sm:text-xl">Move with us through forests, ridges and crater rims around Nairobi. All levels welcome, beginners especially. Bring your friends, or come and make some.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="btn btn-gold">Find your adventure <Icon name="arrow" /></Link>
              <Link href="/activities" className="btn btn-cream">What we do</Link>
            </div>
          </div>
          {next && (
            <div className="relative">
              <div className="absolute -right-4 -top-20 z-10 hidden size-32 sm:block" aria-hidden>
                <svg viewBox="0 0 120 120" className="size-full animate-spin-slow text-gold">
                  <defs><path id="ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
                  <text className="font-display" fontSize="12.5" fontWeight="700" letterSpacing="3.2" fill="currentColor"><textPath href="#ring"></textPath></text>
                </svg>
                <img src="/brand/peak-pals-icon-app.svg" alt="" className="absolute inset-[30%] size-[40%]" />
              </div>
              <div className="sticker relative bg-cream p-6">
                <p className="kicker">Next departure</p>
                <h2 className="mt-1 text-3xl">{next.event.title}</h2>
                <ul className="mt-4 space-y-2 font-semibold">
                  <li className="flex items-center gap-2"><Icon name="calendar" className="size-5 text-orange" />{fmtDate(next.event.startsAt, { weekday: "long", day: "numeric", month: "long" })} · {fmtTime(next.event.startsAt)}</li>
                  <li className="flex items-center gap-2"><Icon name="pin" className="size-5 text-orange" />{next.event.region}</li>
                  <li className="flex items-center gap-2"><Icon name="users" className="size-5 text-orange" />{Math.max(0, next.event.capacity - next.booked)} spots left · {kes(next.event.priceKes)}</li>
                </ul>
                <Link href={`/events/${next.event.slug}`} className="btn btn-primary mt-5 w-full">Save my spot</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Marquee />

      {/* ACTIVITIES */}
      <section className="topo">
        <div className="wrap py-20">
          <div className="mb-10 max-w-2xl">
            <p className="kicker">What we do</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Three ways to get moving</h2>
            <p className="mt-3 text-lg text-moss">Pick the one that fits your week, or mix them up. Moving is a way of life, and there's no wrong way to start.</p>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {ACTIVITIES.map((a) => (
              <Link key={a.title} href={a.href} className={`sticker sticker-hover reveal group flex flex-col gap-4 p-7 ${a.color} ${a.rot}`}>
                <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-night bg-paper text-forest"><Icon name={a.icon} className="size-9" /></span>
                <h3 className="!text-inherit text-3xl">{a.title}</h3>
                <p className="opacity-90">{a.body}</p>
                <span className="mt-auto inline-flex items-center gap-2 font-display font-bold">See dates <Icon name="arrow" className="size-5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="wrap py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">On the calendar</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Upcoming adventures</h2>
          </div>
          <Link href="/events" className="btn btn-ghost">All events <Icon name="arrow" /></Link>
        </div>
        {events.length ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((r, i) => <EventCard key={r.event.id} row={r} index={i} />)}
          </div>
        ) : (
          <div className="sticker bg-cream p-10 text-center"><p className="font-display text-2xl font-bold text-forest">New dates are on the way.</p><p className="mt-2">Join the newsletter below and you'll hear first.</p></div>
        )}
      </section>

      {/* DIFFICULTY */}
      <section className="bg-cream">
        <Ridge from="#FBF7E6" back="#FBD569" front="#F7EFCA" />
        <div className="wrap py-16">
          <div className="mb-10 max-w-2xl">
            <p className="kicker">Pick your peak</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Every trail is clearly graded</h2>
            <p className="mt-3 text-lg text-moss">No surprises. Each event shows its level, distance, climb and exactly what's included in the price.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {LEVELS.map((l) => (
              <div key={l.name} className="sticker reveal relative overflow-hidden bg-paper p-7">
                <div className={`absolute -right-6 -top-6 size-28 rounded-full ${l.tone} opacity-90`} aria-hidden />
                <Peaks n={l.n} className={`relative scale-[2.2] origin-left ${l.n === 3 ? "text-brown" : l.n === 2 ? "text-orange" : "text-olive"}`} />
                <h3 className="relative mt-6 text-3xl">{l.name}</h3>
                <p className="relative mt-2 font-semibold">{l.who}</p>
                <p className="relative mt-1 text-moss">{l.what}</p>
              </div>
            ))}
          </div>
          <p className="hand mt-8 text-center text-3xl text-brown">Not sure? Start with Easy. Nobody gets left behind.</p>
        </div>
      </section>

      {/* WHO */}
      <section className="wrap grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <p className="kicker">Is this for me?</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Yes. Whoever you are, if you want to move.</h2>
          <p className="mt-4 text-lg text-moss">From complete beginners to seasoned athletes, office teams to solo explorers. Events are open to everyone aged 13 and over (under-18s with a parent or guardian's consent).</p>
          <Link href="/team-building" className="btn btn-primary mt-7">Bring your team <Icon name="arrow" /></Link>
        </div>
        <ul className="flex flex-wrap gap-3" aria-label="Who joins us">
          {["Nature lovers", "Fitness enthusiasts", "Office workers", "Team-building groups", "Runners", "Swimmers", "Hikers", "Cyclists", "Gym-goers", "First-timers", "Friends of friends", "Solo explorers"].map((p, i) => (
            <li key={p} className={`sticker px-5 py-3 font-display text-lg font-bold ${["bg-cream", "bg-sand", "bg-white", "bg-gold"][i % 4]} ${i % 3 === 0 ? "-rotate-2" : i % 3 === 1 ? "rotate-1" : "rotate-0"}`}>{p}</li>
          ))}
        </ul>
      </section>

      {/* MEMORIES */}
      {photos.length > 0 && (
        <section className="topo-light overflow-hidden border-y-2 border-night bg-forest py-20">
          <div className="wrap">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker !text-gold">From the trail</p>
                <h2 className="mt-2 text-4xl !text-cream sm:text-5xl">Memories we made together</h2>
              </div>
              <Link href="/memories" className="btn btn-cream">Open the album <Icon name="arrow" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {photos.slice(0, 6).map((p, i) => (
                <Link key={p.id} href={`/memories/${p.albumSlug}`} className={`reveal relative block rounded-md border-2 border-night bg-paper p-3 pb-4 shadow-[6px_6px_0_#1F3320] transition-transform hover:-translate-y-1 hover:rotate-0 ${["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1", "rotate-1"][i]}`}>
                  <span className="tape" aria-hidden />
                  <Photo file={p.file} thumb={p.thumb} blur={p.blur} alt={p.alt ?? p.caption ?? "Peak Pals hike photo"} className="aspect-[4/3] w-full rounded-sm object-cover" sizes="(min-width: 768px) 30vw, 45vw" />
                  {p.caption && <span className="hand mt-2 block text-xl leading-tight text-forest sm:text-2xl">{p.caption}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MERCH */}
      {merch.length > 0 && (
        <section className="topo">
          <div className="wrap py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker">The trail shop</p>
                <h2 className="mt-2 text-4xl sm:text-5xl">Gear up with the crew</h2>
                <p className="mt-3 max-w-xl text-lg text-moss">Tees, hoodies, caps and trail essentials. Collect at any event or get it delivered.</p>
              </div>
              <Link href="/shop" className="btn btn-ghost">Visit the shop <Icon name="arrow" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-4">
              {merch.map((p, i) => <ProductCard key={p.id} p={p} tilt={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* HOW */}
      <section className="wrap py-20">
        <p className="kicker">How it works</p>
        <h2 className="mt-2 text-4xl sm:text-5xl">From booking to trailhead</h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          <svg className="absolute left-0 right-0 top-8 hidden h-6 w-full md:block" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden>
            <path d="M40 12 C200 -6 300 30 500 12 S800 -6 960 12" fill="none" stroke="#8C3703" strokeWidth="3" strokeDasharray="10 9" strokeLinecap="round" />
          </svg>
          {STEPS.map((s, i) => (
            <li key={s.t} className="reveal relative">
              <span className="relative z-10 flex size-16 items-center justify-center rounded-full border-2 border-night bg-gold font-display text-2xl font-bold text-night shadow-[4px_4px_0_#1F3320]">{i + 1}</span>
              <h3 className="mt-4 text-2xl">{s.t}</h3>
              <p className="mt-1 text-moss">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* VALUES */}
      <section className="bg-cream py-20">
        <div className="wrap">
          <div className="mb-10 max-w-2xl">
            <p className="kicker">What we stand for</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Four values, every trail</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <div key={v.t} className="reveal relative pt-6">
                <div className="absolute left-8 top-0 h-full w-2 rounded-full bg-brown" aria-hidden />
                <div className={`sticker relative p-6 ${["bg-paper", "bg-sand", "bg-paper", "bg-sand"][i]} ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                  <span className="font-display text-sm font-bold text-orange">0{i + 1}</span>
                  <h3 className="mt-1 text-2xl">{v.t}</h3>
                  <p className="hand mt-2 text-2xl leading-tight text-brown">{v.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap pt-20">
        <div className="sticker relative isolate overflow-hidden bg-night px-6 py-16 text-center sm:px-12">
          <img src="/images/snowy-ridges.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-45" loading="lazy" />
          <p className="hand text-3xl text-sand">Your next summit is waiting</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-4xl !text-cream sm:text-6xl">Lace up. We&apos;ll handle the rest.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/events" className="btn btn-gold">Browse events</Link>
            <Link href="/team-building" className="btn btn-cream">Plan a team day</Link>
          </div>
        </div>
      </section>
    </>
  );
}
