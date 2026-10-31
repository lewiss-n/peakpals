/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Team building", description: "Outdoor team-building days for companies, clubs and groups in and around Nairobi." };

export default function TeamBuildingPage() {
  return (
    <div className="topo">
      <section className="relative isolate overflow-hidden border-b-2 border-night bg-night">
        <img src="/images/green-valley.webp" alt="A wide green valley between rocky mountains" className="absolute inset-0 -z-10 size-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night to-night/20" />
        <div className="wrap py-24 text-cream sm:py-32">
          <p className="hand text-3xl text-sand">Out of the office, onto the trail</p>
          <h1 className="mt-2 max-w-3xl text-5xl !text-cream sm:text-7xl">Team building that actually builds teams</h1>
          <p className="mt-5 max-w-xl text-lg text-cream/90">A shared climb does more for a team than any trust fall. We design days that fit your group&apos;s fitness, size and goals.</p>
        </div>
      </section>
      <section className="wrap grid gap-12 py-16 lg:grid-cols-[1fr_520px]">
        <div>
          <h2 className="text-4xl">What a team day can look like</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              { i: "hike", t: "Guided group hikes", d: "Easy forest walks to proper summit days, graded so everyone can take part." },
              { i: "yoga", t: "Bootcamp sessions", d: "Zumba, kata-box, yoga or Pilates, outdoors or at your venue." },
              { i: "run", t: "Virtual team challenges", d: "Department vs department kilometre challenges over a month." },
              { i: "users", t: "Mix & match", d: "Combine a morning hike with a cool-down yoga session and lunch." },
            ].map((x) => (
              <li key={x.t} className="sticker bg-paper p-5">
                <Icon name={x.i} className="size-9 text-orange" />
                <h3 className="mt-3 text-2xl">{x.t}</h3>
                <p className="mt-1 text-moss">{x.d}</p>
              </li>
            ))}
          </ul>
          <p className="hand mt-10 text-3xl text-brown">Tell us about your crew and we&apos;ll put together a proposal.</p>
        </div>
        <div className="sticker bg-white p-6 sm:p-8">
          <h2 className="text-3xl">Plan your team day</h2>
          <EnquiryForm />
        </div>
      </section>
    </div>
  );
}
