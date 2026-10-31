/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Ridge } from "@/components/Ridge";

export const metadata: Metadata = { title: "Activities", description: "Day hikes, fitness bootcamps and virtual run challenges with Peak Pals Adventures." };

const BLOCKS = [
  {
    id: "hiking", icon: "hike", kicker: "Our home turf", title: "Hiking", img: "/images/forest-trail.webp", alt: "A hiker on a rocky path through pine forest toward a mountain",
    body: "Guided day hikes graded Easy, Moderate or Difficult, close to Nairobi or further out. Our guides set a comfortable pace, carry first aid and know every bend of the trail. Multi-day adventures are coming in our second year.",
    points: ["Clear difficulty grading on every hike", "Small groups with trained guides", "Park and entry fees spelled out in the price", "Near Nairobi or out-of-town trips"],
    href: "/events?activity=HIKE", cta: "See upcoming hikes",
  },
  {
    id: "bootcamps", icon: "yoga", kicker: "Train together", title: "Health & fitness bootcamps", img: "/images/winding-meadow-path.webp", alt: "A gravel path curving across a green hillside",
    body: "Instructor-led sessions that make fitness feel like a party. Choose your vibe, and every move comes with an easier and a harder option.",
    points: ["Zumba", "Kata-box", "Yoga", "Pilates"],
    href: "/events?activity=BOOTCAMP", cta: "See upcoming bootcamps",
  },
  {
    id: "runs", icon: "run", kicker: "Anywhere, anytime", title: "Virtual running challenges", img: "/images/ridge-walker.webp", alt: "A hiker walking along a grassy ridge above a lake",
    body: "Monthly challenges you complete on your own schedule, wherever you are. Log your kilometres, check in with the community and celebrate together at the finish.",
    points: ["Run or walk, your choice", "Weekly check-ins to keep you going", "Finisher shout-outs", "Great for building a habit"],
    href: "/events?activity=RUN_CHALLENGE", cta: "See open challenges",
  },
];

export default function ActivitiesPage() {
  return (
    <>
      <section className="topo">
        <div className="wrap pb-12 pt-14">
          <p className="kicker">Activities</p>
          <h1 className="mt-2 max-w-3xl text-5xl sm:text-6xl">Find the way of moving that moves you</h1>
          <p className="mt-4 max-w-2xl text-lg text-moss">Whether you want a big summit, a sweaty Saturday session or a challenge that fits around work, there&apos;s a place for you here.</p>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Jump to">
            {BLOCKS.map((b) => <a key={b.id} href={`#${b.id}`} className="chip">{b.title}</a>)}
          </nav>
        </div>
      </section>
      {BLOCKS.map((b, i) => (
        <section key={b.id} id={b.id} className={`scroll-mt-24 ${i % 2 ? "bg-cream" : ""}`}>
          <div className={`wrap grid items-center gap-10 py-16 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative">
              <img src={b.img} alt={b.alt} loading="lazy" className={`sticker aspect-[4/3] w-full object-cover ${i % 2 ? "rotate-1" : "-rotate-1"}`} />
              <span className="absolute -bottom-5 left-6 flex size-20 items-center justify-center rounded-full border-2 border-night bg-gold text-night shadow-[4px_4px_0_#1F3320]"><Icon name={b.icon} className="size-10" /></span>
            </div>
            <div>
              <p className="kicker">{b.kicker}</p>
              <h2 className="mt-2 text-4xl sm:text-5xl">{b.title}</h2>
              <p className="mt-4 text-lg">{b.body}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {b.points.map((p) => <li key={p} className="flex items-center gap-2 rounded-2xl border-2 border-night/15 bg-white px-4 py-3 font-semibold"><Icon name="check" className="size-5 text-forest" strokeWidth={2.6} />{p}</li>)}
              </ul>
              <Link href={b.href} className="btn btn-primary mt-7">{b.cta} <Icon name="arrow" /></Link>
            </div>
          </div>
        </section>
      ))}
      <Ridge from="#FBF7E6" back="#FBD569" front="#FFBA08" />
      <section className="bg-gold">
        <div className="wrap flex flex-col items-start gap-5 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-4xl !text-night">Bringing a group?</h2>
            <p className="mt-2 max-w-xl text-lg">We design team-building days for offices, clubs and friend groups: hikes, bootcamps or a mix of both.</p>
          </div>
          <Link href="/team-building" className="btn btn-primary">Plan a team day</Link>
        </div>
      </section>
    </>
  );
}
