import Link from "next/link";
import type { ProductWithImages } from "@/lib/merch";
import { kes } from "@/lib/format";
import { Photo } from "./Photo";
import { ProductArt } from "./ProductArt";

export function ProductCard({ p, tilt = 0 }: { p: ProductWithImages; tilt?: number }) {
  const img = p.photos[0];
  return (
    <article className={`sticker sticker-hover reveal group relative flex flex-col overflow-hidden ${tilt % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
      <div className="relative aspect-square overflow-hidden border-b-2 border-night bg-cream">
        {img ? (
          <Photo file={img.file} thumb={img.thumb} blur={img.blur} alt={p.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <ProductArt art={p.art} className="size-full transition-transform duration-500 group-hover:scale-105" />
        )}
        {!p.inStock && <span className="absolute left-2 top-2 rotate-[-4deg] rounded-full border-2 border-night bg-brown px-2.5 py-0.5 font-display text-xs sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-sm font-bold text-white">Sold out</span>}
        {p.inStock && p.featured && <span className="absolute left-2 top-2 rotate-[-4deg] rounded-full border-2 border-night bg-gold px-2.5 py-0.5 font-display text-xs sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-sm font-bold text-night">Crew favourite</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:gap-2 sm:p-5">
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-brown">{p.category}</p>
        <h3 className="text-base sm:text-xl">
          <Link href={`/shop/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">{p.name}</Link>
        </h3>
        <p className="hidden text-[15px] text-night/80 sm:line-clamp-2">{p.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-display text-base font-bold text-forest sm:text-xl">{kes(p.priceKes)}</p>
          <span className="hidden rounded-full border-2 border-night bg-paper px-3 py-1 font-display text-sm font-bold transition-colors group-hover:bg-gold sm:inline">{p.inStock ? "Get it" : "View"}</span>
        </div>
      </div>
    </article>
  );
}
