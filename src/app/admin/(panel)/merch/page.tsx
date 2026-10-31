/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { kes } from "@/lib/format";
import { mediaUrl } from "@/lib/media-url";
import { Icon } from "@/components/Icon";
import { ProductArt } from "@/components/ProductArt";
import { MerchTabs } from "@/components/admin/MerchTabs";

export const metadata = { title: "Merch shop" };

export default async function AdminMerch({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const { products, merchOrders, media } = schema;
  const rows = await db.select({
    p: products,
    sold: sql<number>`coalesce((select sum(quantity) from ${merchOrders} o where o.product_id = ${products.id} and o.status <> 'CANCELLED'),0)::int`,
  }).from(products).orderBy(desc(products.featured), asc(products.sortOrder), desc(products.createdAt));
  const covers = rows.map((r) => r.p.images[0]).filter(Boolean);
  const thumbs = covers.length ? await db.select({ id: media.id, thumb: media.thumb, file: media.file }).from(media).where(inArray(media.id, covers)) : [];
  const tmap = new Map(thumbs.map((t) => [t.id, t.thumb ?? t.file]));
  const [{ pending }] = await db.select({ pending: sql<number>`count(*)::int` }).from(merchOrders).where(eq(merchOrders.status, "PENDING"));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">The trail shop</p><h1 className="mt-1 text-4xl">Merch shop</h1></div>
        <Link href="/admin/merch/new" className="btn btn-gold"><Icon name="plus" className="size-5" />Add merch</Link>
      </div>
      <MerchTabs active="products" pending={pending} />
      {sp.saved && <p role="status" className="rounded-2xl border-2 border-olive bg-olive/15 p-3 font-semibold">Saved “{sp.saved}”.</p>}
      {sp.deleted && <p role="status" className="rounded-2xl border-2 border-brown/40 bg-brown/10 p-3 font-semibold">Item removed from the shop.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ p, sold }) => {
          const t = p.images[0] ? tmap.get(p.images[0]) : null;
          return (
            <div key={p.id} className="sticker flex flex-col overflow-hidden bg-white">
              <div className="relative aspect-[4/3] border-b-2 border-night bg-cream">
                {t ? <img src={mediaUrl(t)!} alt="" className="size-full object-cover" /> : <ProductArt art={p.art} className="size-full" />}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {!p.published && <span className="rounded-full bg-night px-2.5 py-0.5 font-display text-xs font-bold text-cream">Hidden</span>}
                  {!p.inStock && <span className="rounded-full bg-brown px-2.5 py-0.5 font-display text-xs font-bold text-white">Sold out</span>}
                  {p.featured && <span className="rounded-full bg-gold px-2.5 py-0.5 font-display text-xs font-bold text-night">Featured</span>}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-brown">{p.category}</p>
                <p className="font-display text-xl font-bold text-forest">{p.name}</p>
                <p className="text-sm text-moss">{kes(p.priceKes)} · {sold} sold{p.sizes.length ? ` · ${p.sizes.join(", ")}` : ""}</p>
                <div className="mt-auto flex gap-4 pt-3">
                  <Link href={`/admin/merch/${p.id}`} className="font-display font-bold text-forest hover:text-orange">Edit</Link>
                  {p.published && <Link href={`/shop/${p.slug}`} target="_blank" className="font-display font-bold text-forest hover:text-orange">View</Link>}
                </div>
              </div>
            </div>
          );
        })}
        {!rows.length && <p className="sticker bg-white p-10 text-center text-moss sm:col-span-3">No merch yet. <Link href="/admin/merch/new" className="underline">Add your first item</Link>.</p>}
      </div>
    </div>
  );
}
