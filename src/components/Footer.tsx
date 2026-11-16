/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";
import { NewsletterForm } from "./NewsletterForm";
import { Ridge } from "./Ridge";

export function Footer() {
  return (
    <footer className="mt-24">
      <Ridge from="transparent" back="#1B4DA0" front="#0E2348" />
      <div className="topo-light border-b-[6px] border-orange bg-navy text-sky">
        <div className="wrap grid gap-12 py-14 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <img src="/brand/peak-pals-logo-reversed.svg" alt="Peak Pals Adventures, conquer your peak" width={180} height={196} className="w-40" />
            <p className="max-w-xs text-sky/85">Hikes, bootcamps and run challenges for everyone who wants to move, connect with nature and find their people.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] !text-orange">Explore</h2>
              <ul className="space-y-2 font-semibold">
                <li><Link className="hover:text-orange" href="/events">Upcoming events</Link></li>
                <li><Link className="hover:text-orange" href="/activities">Activities</Link></li>
                <li><Link className="hover:text-orange" href="/memories">Memories</Link></li>
                <li><Link className="hover:text-orange" href="/shop">Shop</Link></li>
                <li><Link className="hover:text-orange" href="/team-building">Team building</Link></li>
                <li><Link className="hover:text-orange" href="/about">About us</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] !text-orange">Say hi</h2>
              <ul className="space-y-2 font-semibold">
                <li><a className="inline-flex items-center gap-2 hover:text-orange" href={`mailto:${site.email}`}><Icon name="mail" className="size-4" />Email us</a></li>
                <li><a className="inline-flex items-center gap-2 hover:text-orange" href={`tel:${site.phone.replace(/\s/g, "")}`}><Icon name="phone" className="size-4" /><span className="whitespace-nowrap">{site.phone}</span></a></li>
                <li><a className="inline-flex items-center gap-2 hover:text-orange" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener"><Icon name="whatsapp" className="size-4" />WhatsApp</a></li>
                {site.socials.map((s) => <li key={s.label}><a className="hover:text-orange" href={s.href} target="_blank" rel="noopener">{s.label}</a></li>)}
              </ul>
            </div>
          </div>
          <NewsletterForm dark />
        </div>
        <div className="border-t border-sky/15">
          <div className="wrap flex flex-col gap-2 py-5 text-sm text-sky/75 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {site.legalName} · {site.city}</p>
            <p className="flex gap-5"><Link href="/privacy" className="hover:text-orange">Privacy policy</Link><Link href="/terms" className="hover:text-orange">Terms &amp; conditions</Link></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
