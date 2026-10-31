import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="topo-light flex shrink-0 flex-col gap-6 bg-forest p-5 text-cream lg:sticky lg:top-0 lg:h-dvh lg:w-64">
        <Link href="/admin" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/peak-pals-icon-app.svg" alt="" className="size-11" />
          <span className="leading-tight"><span className="block font-display text-lg font-bold">Peak Pals</span><span className="font-display text-xs font-bold tracking-[0.25em] text-gold">BASE CAMP</span></span>
        </Link>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-3 border-t border-cream/15 pt-4 text-sm lg:flex">
          <p className="truncate text-cream/80">Signed in as <b className="text-cream">{s.name}</b></p>
          <Link href="/" target="_blank" className="inline-flex items-center gap-2 font-semibold hover:text-gold"><Icon name="external" className="size-4" />View website</Link>
          <form action={logout}><button className="inline-flex items-center gap-2 font-semibold hover:text-gold"><Icon name="logout" className="size-4" />Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-4 border-b-2 border-night/10 px-5 py-2 text-sm lg:hidden">
          <Link href="/" target="_blank" className="font-semibold">View website</Link>
          <form action={logout}><button className="font-semibold">Sign out</button></form>
        </div>
        <div className="mx-auto max-w-6xl p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
