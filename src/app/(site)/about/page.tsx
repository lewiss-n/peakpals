/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Ridge } from "@/components/Ridge";

export const metadata: Metadata = { title: "About us", description: "Our story, vision, mission and values." };

const VALUES = [
  { t: "Consistency", s: "Do it your way, as long as you're doing it.", d: "Progress comes from showing up regularly, at your own pace. We celebrate the habit, not just the summit.", c: "bg-forest text-cream" },
  { t: "Discipline", s: "Show up always.", d: "On time, prepared and committed, whether it's a 6 am trailhead or a rainy bootcamp.", c: "bg-olive text-white" },
  { t: "Integrity & Accountability", s: "We deliver on our promises.", d: "Clear prices, honest difficulty ratings and safety first, every single time.", c: "bg-gold text-night" },
  { t: "The Extra Mile", s: "The best experience in everything we do.", d: "From the welcome message to the last photo, we look for the small things that make a day unforgettable.", c: "bg-orange text-night" },
];

export default function AboutPage() {
  return (
    <>
      <section className="topo">
        <div className="wrap grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="kicker">Our story</p>
            <h1 className="mt-2 text-5xl sm:text-6xl">Moving is a way of life</h1>
            <p className="mt-5 text-xl leading-relaxed">Peak Pals Adventures grew out of our founders&apos; own experience of <b>moving as a way of life</b>: long hikes, slow walks and <b>earthing</b>, the simple act of reconnecting with the ground beneath your feet.</p>
            <p className="mt-4 text-lg text-moss">We started Peak Pals so more people could feel that too, together. We take people out of the office and the gym and onto trails, into fresh air and into a community that shows up for each other. Every adventure is a chance to discover something about yourself and to appreciate nature a little more.</p>
            <p className="hand mt-6 text-3xl text-brown">Do it your way, as long as you&apos;re doing it.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <img src="/images/ridge-walker.webp" alt="A hiker walking along a narrow grassy ridge high above a lake" className="sticker aspect-[3/4] w-full rotate-2 object-cover" />
            <div className="sticker absolute -bottom-6 -left-4 -rotate-3 bg-gold px-5 py-3 font-display text-lg font-bold">Est. in Nairobi</div>
          </div>
        </div>
      </section>

      <Ridge from="#FBF7E6" back="#899536" front="#355A35" />
      <section className="topo-light bg-forest text-cream">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="kicker !text-gold">Vision</p>
            <h2 className="mt-2 text-4xl !text-cream">Where we&apos;re headed</h2>
            <ul className="mt-6 space-y-4 text-lg">
              {["To be the preferred service provider for people to move and integrate with nature.",
                "To inspire a culture of adventure where every journey is a discovery of self and a connection to nature.",
                "To cultivate a community where every adventure is an opportunity for self-discovery, growth and appreciation of nature."].map((v) => (
                <li key={v} className="flex gap-3"><svg viewBox="0 0 10 9" className="mt-2 h-3 w-3.5 shrink-0 text-gold"><path d="M0 9 5 0l5 9z" fill="currentColor" /></svg>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker !text-gold">Mission</p>
            <h2 className="mt-2 text-4xl !text-cream">How we get there</h2>
            <ul className="mt-6 space-y-4 text-lg">
              {["To champion responsible explorations of nature and build sustainable, healthy communities.",
                "To enable people to connect with nature and self, and to build community, in a sustainable manner."].map((v) => (
                <li key={v} className="flex gap-3"><svg viewBox="0 0 10 9" className="mt-2 h-3 w-3.5 shrink-0 text-gold"><path d="M0 9 5 0l5 9z" fill="currentColor" /></svg>{v}</li>
              ))}
            </ul>
            <div className="mt-8 rounded-3xl border-2 border-cream/30 p-6">
              <p className="hand text-3xl text-sand">We help people move, connect with nature and find their people, one peak at a time.</p>
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
        <div className="sticker grid gap-6 bg-cream p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-night bg-paper text-forest"><Icon name="leaf" className="size-9" /></span>
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
