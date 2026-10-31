import Link from "next/link";
import { getDashboard, RANGES, type RangeKey } from "@/lib/analytics";
import { BarList, Donut, TrendChart } from "@/components/admin/Charts";
import { Icon } from "@/components/Icon";
import { fmtDate, kes } from "@/lib/format";

export const metadata = { title: "Dashboard" };

function delta(cur: number, prev: number) {
  if (!prev) return cur ? { txt: "new", up: true } : null;
  const p = Math.round(((cur - prev) / prev) * 100);
  return { txt: `${p > 0 ? "+" : ""}${p}%`, up: p >= 0 };
}

function Kpi({ label, value, sub, d, icon }: { label: string; value: string; sub?: string; d?: { txt: string; up: boolean } | null; icon: string }) {
  return (
    <div className="sticker bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold text-moss">{label}</p>
        <Icon name={icon} className="size-5 text-orange" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-forest">{value}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-moss">
        {d && <span className={`rounded-full px-2 py-0.5 font-bold ${d.up ? "bg-olive/20 text-forest" : "bg-brown/10 text-brown"}`}>{d.txt}</span>}
        {sub}
      </p>
    </div>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const r = (await searchParams).range;
  const range: RangeKey = r && r in RANGES ? (r as RangeKey) : "30d";
  const d = await getDashboard(range);
  const conv = d.totals.visitors ? ((d.bk.bookings / d.totals.visitors) * 100).toFixed(1) : "0.0";
  const ppv = d.totals.sessions ? (d.totals.views / d.totals.sessions).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Base camp</p>
          <h1 className="mt-1 text-4xl">Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-moss"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-olive opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-olive" /></span>{d.live} {d.live === 1 ? "visitor" : "visitors"} on the site right now</p>
        </div>
        <nav className="flex gap-1 rounded-full border-2 border-night bg-white p-1" aria-label="Date range">
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <Link key={k} href={`/admin?range=${k}`} aria-current={k === range ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 font-display text-sm font-bold ${k === range ? "bg-forest text-cream" : "hover:bg-cream"}`}>Last {RANGES[k]} days</Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Visitors" icon="users" value={d.totals.visitors.toLocaleString()} d={delta(d.totals.visitors, d.totals.pvisitors)} sub="vs previous period" />
        <Kpi label="Page views" icon="chart" value={d.totals.views.toLocaleString()} d={delta(d.totals.views, d.totals.pviews)} sub={`${ppv} pages per visit`} />
        <Kpi label="Bookings" icon="ticket" value={d.bk.bookings.toLocaleString()} d={delta(d.bk.bookings, d.bk.pbookings)} sub={`${d.bk.people} participants · ${conv}% conversion`} />
        <Kpi label="Confirmed revenue" icon="star" value={kes(d.bk.revenue)} sub={`${kes(d.bk.pending)} awaiting payment`} />
      </div>

      <section className="sticker bg-white p-6">
        <h2 className="text-2xl">Traffic &amp; bookings</h2>
        <div className="mt-4"><TrendChart data={d.daily} series={[{ key: "views", label: "Page views", color: "#899536", fill: true }, { key: "visitors", label: "Visitors", color: "#355A35" }, { key: "bookings", label: "Bookings", color: "#E85D04" }]} /></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="sticker bg-white p-6">
          <h2 className="mb-4 text-2xl">Top pages</h2>
          <BarList items={d.topPages.map((p) => ({ label: p.path, value: p.views }))} />
        </section>
        <section className="sticker bg-white p-6">
          <h2 className="mb-4 text-2xl">Where visitors come from</h2>
          <BarList items={d.referrers.map((p) => ({ label: p.source, value: p.visitors }))} />
        </section>
        <section className="sticker bg-white p-6">
          <h2 className="mb-4 text-2xl">Devices</h2>
          <Donut items={d.devices.map((x, i) => ({ label: x.device, value: x.visitors, color: ["#355A35", "#E85D04", "#FFBA08", "#899536"][i % 4] }))} />
        </section>
        <section className="sticker bg-white p-6">
          <h2 className="mb-4 text-2xl">Browsers</h2>
          <Donut items={d.browsers.map((x, i) => ({ label: x.browser, value: x.visitors, color: ["#355A35", "#E85D04", "#FFBA08", "#899536", "#8C3703", "#FBD569"][i % 6] }))} />
        </section>
      </div>

      <section className="sticker overflow-hidden bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-3">
          <h2 className="text-2xl">Upcoming events</h2>
          <Link href="/admin/events/new" className="btn btn-gold !min-h-10 !py-2"><Icon name="plus" className="size-5" />New event</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream font-display text-forest"><tr><th className="px-6 py-3">Event</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Page views</th><th className="px-3 py-3">Bookings</th><th className="px-6 py-3">Spots filled</th></tr></thead>
            <tbody>
              {d.eventFunnel.map((e) => {
                const pct = Math.round((e.booked / e.capacity) * 100);
                return (
                  <tr key={e.id} className="border-t border-night/10">
                    <td className="px-6 py-3 font-semibold"><Link href={`/admin/events/${e.id}`} className="hover:text-orange">{e.title}</Link></td>
                    <td className="px-3 py-3">{fmtDate(e.starts_at, { day: "numeric", month: "short" })}</td>
                    <td className="px-3 py-3">{e.views}</td>
                    <td className="px-3 py-3">{e.bookings}{e.views ? <span className="text-moss"> ({Math.round((e.bookings / e.views) * 100)}%)</span> : null}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2"><div className="h-2.5 w-28 overflow-hidden rounded-full bg-cream"><div className={`h-full ${pct >= 100 ? "bg-brown" : pct >= 80 ? "bg-orange" : "bg-olive"}`} style={{ width: `${Math.min(100, pct)}%` }} /></div><span className="font-semibold">{e.booked}/{e.capacity}</span></div>
                    </td>
                  </tr>
                );
              })}
              {!d.eventFunnel.length && <tr><td colSpan={5} className="px-6 py-8 text-center text-moss">No upcoming events. <Link href="/admin/events/new" className="underline">Add one</Link>.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/merch/orders" className="sticker sticker-hover bg-gold p-5"><p className="font-display text-sm font-bold">Merch shop</p><p className="mt-1 font-display text-3xl font-bold">{d.counts.merchPending} to process</p><p className="text-sm">{d.counts.merchItems} items ordered · {kes(d.counts.merchRevenue)} paid</p></Link>
        <Link href="/admin/enquiries" className="sticker sticker-hover bg-sand p-5"><p className="font-display text-sm font-bold">Team-building enquiries</p><p className="mt-1 font-display text-3xl font-bold">{d.counts.newEnquiries} new</p><p className="text-sm">{d.counts.enquiries} in total</p></Link>
        <Link href="/admin/subscribers" className="sticker sticker-hover bg-cream p-5"><p className="font-display text-sm font-bold">Newsletter subscribers</p><p className="mt-1 font-display text-3xl font-bold">{d.counts.subscribers}</p><p className="text-sm">+{d.counts.newSubs} in this period</p></Link>
        <Link href="/admin/events" className="sticker sticker-hover bg-white p-5"><p className="font-display text-sm font-bold">Published upcoming events</p><p className="mt-1 font-display text-3xl font-bold">{d.counts.upcoming}</p><p className="text-sm">Manage events</p></Link>
      </div>
      <p className="text-sm text-moss">Analytics are first-party and privacy-friendly: no IP addresses are stored, and visitors with Do Not Track or Global Privacy Control enabled are not counted.</p>
    </div>
  );
}
