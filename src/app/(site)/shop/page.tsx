import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, getProducts } from "@/lib/merch";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop", description: "Peak Pals tees, hoodies, caps, bottles and trail gear." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = category && (CATEGORIES as readonly string[]).includes(category) ? category : "";
  const products = await getProducts(active);
  return (
    <div className="topo">
      <section className="wrap grid items-end gap-6 pb-6 pt-14 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="kicker">The trail shop</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">Gear up with the crew</h1>
          <p className="mt-3 max-w-2xl text-lg text-moss">Tees, hoodies, caps and trail essentials, made for Peak Pals and the people who walk with us. Collect your order at any event or get it delivered.</p>
        </div>
        <p className="hand -rotate-2 text-3xl text-brown">Wear the badge. Earn the summit.</p>
      </section>
      <section className="wrap">
        <nav className="flex flex-wrap gap-2" aria-label="Categories">
          <Link href="/shop" className="chip" aria-current={!active ? "true" : undefined} scroll={false}>Everything</Link>
          {CATEGORIES.map((c) => <Link key={c} href={`/shop?category=${c}`} className="chip" aria-current={active === c ? "true" : undefined} scroll={false}>{c}</Link>)}
        </nav>
      </section>
      <section className="wrap py-10">
        {products.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} p={p} tilt={i} />)}
          </div>
        ) : (
          <div className="sticker bg-cream p-10 text-center">
            <p className="font-display text-2xl font-bold text-forest">{active ? `No ${active.toLowerCase()} right now.` : "New merch is on the way."}</p>
            {active && <Link href="/shop" className="btn btn-primary mt-6">See everything</Link>}
          </div>
        )}
      </section>
      <section className="wrap pb-6">
        <div className="sticker grid gap-6 bg-forest p-8 text-cream sm:grid-cols-3">
          {[
            { i: "calendar", t: "Collect at events", d: "Free pick-up at any Peak Pals hike or bootcamp." },
            { i: "pin", t: "Nairobi delivery", d: "Rider delivery anywhere in Nairobi, or courier countrywide." },
            { i: "phone", t: "Pay with M-Pesa", d: "Place your order, get a reference, pay via Paybill." },
          ].map((x) => (
            <div key={x.t} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-night bg-gold text-night"><Icon name={x.i} className="size-6" /></span>
              <div><h2 className="text-xl !text-cream">{x.t}</h2><p className="text-cream/85">{x.d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
