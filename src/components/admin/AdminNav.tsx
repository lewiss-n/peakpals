"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../Icon";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "chart" },
  { href: "/admin/events", label: "Events", icon: "calendar" },
  { href: "/admin/bookings", label: "Bookings", icon: "ticket" },
  { href: "/admin/memories", label: "Memories", icon: "camera" },
  { href: "/admin/merch", label: "Merch shop", icon: "shirt" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "inbox" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "mail" },
  { href: "/admin/settings", label: "Settings", icon: "users" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 font-display font-bold transition-colors ${active ? "bg-cream text-forest" : "text-cream hover:bg-cream/10"}`}>
            <Icon name={n.icon} className="size-5" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
