"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "./Brand";
import { Icon } from "./Icon";

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/activities", label: "Activities" },
  { href: "/memories", label: "Memories" },
  { href: "/shop", label: "Shop" },
  { href: "/team-building", label: "Team building" },
  { href: "/about", label: "About us" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-50 border-b-2 transition-colors ${scrolled || open ? "border-night bg-paper/95 backdrop-blur" : "border-transparent bg-paper"}`}>
      <div className={`wrap flex items-center justify-between gap-4 transition-[height] duration-300 ${scrolled ? "h-[72px]" : "h-[84px] lg:h-[104px]"}`}>
        <BrandLockup compact={scrolled} />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 font-display text-[15px] font-bold xl:px-4 transition-colors ${active ? "bg-forest text-cream" : "text-night hover:bg-cream"}`}>
                {n.label}
              </Link>
            );
          })}
          <Link href="/events" className="btn btn-gold ml-2 !min-h-11 !px-5 !py-2">Book now</Link>
        </nav>
        <button type="button" className="inline-flex size-12 items-center justify-center rounded-full border-2 border-night bg-cream lg:hidden"
          aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "x" : "menu"} className="size-6" />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="wrap flex flex-col gap-1 pb-5 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-2xl px-4 py-3 font-display text-lg font-bold hover:bg-cream">{n.label}</Link>
          ))}
          <Link href="/events" className="btn btn-gold mt-2">Book an adventure</Link>
        </nav>
      )}
    </header>
  );
}
