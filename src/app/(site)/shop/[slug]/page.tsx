import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/merch";
import { kes } from "@/lib/format";
import { site } from "@/lib/site";
import { mediaUrl } from "@/lib/media-url";
import { Icon } from "@/components/Icon";
import { MerchOrderForm } from "@/components/MerchOrderForm";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Item not found" };
  return { title: p.name, description: p.summary, openGraph: p.photos[0] ? { images: [mediaUrl(p.photos[0].file)!] } : undefined };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.summary, brand: { "@type": "Brand", name: site.name },
    image: p.photos.map((x) => new URL(mediaUrl(x.file)!, site.url).toString()),
    offers: { "@type": "Offer", price: p.priceKes, priceCurrency: "KES", availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };
  return (
    <div className="topo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap py-10">
        <Link href="/shop" className="inline-flex items-center gap-2 font-display font-bold text-forest hover:text-orange"><Icon name="arrow" className="size-4 rotate-180" />Back to the shop</Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <ProductGallery name={p.name} art={p.art} photos={p.photos} />
          <div>
            <p className="kicker">{p.category}</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{p.name}</h1>
            <p className="mt-3 font-display text-3xl font-bold text-orange">{kes(p.priceKes)}</p>
            <p className="mt-4 text-lg">{p.summary}</p>
            {p.description && <div className="mt-3 space-y-3 text-moss">{p.description.split(/\n{2,}/).map((x, i) => <p key={i}>{x}</p>)}</div>}
            <div className="sticker mt-8 bg-white p-6">
              {p.inStock ? (
                <MerchOrderForm productId={p.id} price={p.priceKes} sizes={p.sizes} colors={p.colors} name={p.name} />
              ) : (
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-brown">Sold out for now</p>
                  <p className="mt-2">More stock is on the way. Ask us to save you one.</p>
                  <a className="btn btn-gold mt-4" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi Peak Pals! Please let me know when the ${p.name} is back in stock.`)}`} target="_blank" rel="noopener"><Icon name="whatsapp" className="size-5" />Notify me on WhatsApp</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
