/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Ridge } from "@/components/Ridge";

export const metadata: Metadata = { title: "About us", description: "Our story, vision, mission and values." };

const VALUES = [
  { t: "Consistency", s: "Do it your way, as long as you're doing it.", d: "Progress comes from showing up regularly, at your own pace. We celebrate the habit, not just the summit.", c: "bg-blue text-white" },
  { t: "Discipline", s: "Show up always.", d: "On time, prepared and committed, whether it's a 6 am trailhead or a rainy bootcamp.", c: "bg-navy text-white" },
  { t: "Integrity & Accountability", s: "We deliver on our promises.", d: "Clear prices, honest difficulty ratings and safety first, every single time.", c: "bg-sky text-navy" },
  { t: "The Extra Mile", s: "The best experience in everything we do.", d: "We go beyond what you expect at every step. That means a clear trail brief before you set out, guides who check on everyone (not just the fastest), water and snack stops planned ahead, and photos shared after the trip so the memories last. If a small thing would make your day better, we notice it and we do it.", c: "bg-orange text-navy" },
];

export default function AboutPage() {
  return (
    <>
      <section className="topo">
        <div className="wrap grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="kicker">Our story</p>
            <h1 className="mt-2 text-5xl sm:text-6xl">Moving is a way of life</h1>
            <p className="mt-5 text-xl leading-relaxed">Peak Pals Adventures grew out of our founders&apos; own experience of <b>moving as a way of life</b>. We are all <b>recreational runners</b>, and between runs you&apos;ll find us on long hikes, slow walks and <b>earthing</b>, the simple act of reconnecting with the ground beneath your feet.</p>
            <p className="mt-4 text-lg text-slate">We started Peak Pals so more people could feel that too, together. We take people out of the office and the gym and onto trails, into fresh air and into a community that shows up for each other. Every adventure is a chance to discover something about yourself and to appreciate nature a little more.</p>
            <p className="hand mt-6 text-3xl text-ember">Do it your way, as long as you&apos;re doing it.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <img src="/images/ridge-walker.webp" alt="A hiker walking along a narrow grassy ridge high above a lake" className="sticker aspect-[3/4] w-full rotate-2 object-cover" />
            <div className="sticker absolute -bottom-6 -left-4 -rotate-3 bg-orange px-5 py-3 font-display text-lg font-bold">Est. in Nairobi</div>
          </div>
        </div>
      </section>

      <Ridge from="#F7FAFE" back="#5B8BD9" front="#1B4DA0" />
      <section className="topo-light bg-blue text-sky">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="kicker !text-glow">Vision</p>
            <h2 className="mt-2 text-4xl !text-sky">Where we&apos;re headed</h2>
            <p className="mt-6 text-2xl font-display font-bold leading-snug text-white">To cultivate a community where every adventure is an opportunity for self-discovery, growth and appreciation of nature.</p>
          </div>
          <div>
            <p className="kicker !text-glow">Mission</p>
            <h2 className="mt-2 text-4xl !text-sky">How we get there</h2>
            <p className="mt-6 text-2xl font-display font-bold leading-snug text-white">To enable people to connect with nature and self, and to build community, in a sustainable manner.</p>
            <div className="mt-8 rounded-3xl border-2 border-sky/30 p-6">
              <p className="hand text-3xl text-glow">We help people move, connect with nature and find their people, one peak at a time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-20">
        <p className="kicker">Core values</p>
        <h2 className="mt-2 text-4xl sm:text-5xl">What we stand for</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <div key={v.t} className={`sticker reveal p-7 ${v.c} ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
              <span className="font-display text-sm font-bold opacity-80">0{i + 1}</span>
              <h3 className="mt-1 text-3xl !text-inherit">{v.t}</h3>
              <p className="hand mt-2 text-3xl leading-tight">{v.s}</p>
              <p className="mt-3 opacity-90">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="sticker grid gap-6 bg-sky p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-navy bg-paper text-blue"><Icon name="leaf" className="size-9" /></span>
          <div>
            <h2 className="text-3xl">Leave no trace</h2>
            <p className="mt-1 text-lg">Responsible exploration is part of our mission. We stick to trails, carry out what we carry in, respect wildlife and support the parks and communities we visit.</p>
          </div>
          <Link href="/events" className="btn btn-primary">Join an adventure</Link>
        </div>
      </section>
    </>
  );
}
