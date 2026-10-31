"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/merch";
import { mediaUrl } from "@/lib/media-url";
import { ProductArt } from "./ProductArt";

/* eslint-disable @next/next/no-img-element */
export function ProductGallery({ name, art, photos }: { name: string; art: string; photos: ProductImage[] }) {
  const [i, setI] = useState(0);
  if (!photos.length) {
    return <div className="sticker aspect-square overflow-hidden"><ProductArt art={art} className="size-full" /></div>;
  }
  const cur = photos[Math.min(i, photos.length - 1)];
  return (
    <div className="flex flex-col gap-4">
      <div className="sticker aspect-square overflow-hidden bg-cream">
        <img src={mediaUrl(cur.file)!} alt={`${name}, photo ${i + 1} of ${photos.length}`} className="size-full object-cover"
          style={cur.blur ? { backgroundImage: `url(${cur.blur})`, backgroundSize: "cover" } : undefined} />
      </div>
      {photos.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((ph, k) => (
            <button key={ph.id} type="button" onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i}
              className={`size-20 overflow-hidden rounded-2xl border-2 ${k === i ? "border-orange" : "border-night/30 opacity-75 hover:opacity-100"}`}>
              <img src={mediaUrl(ph.thumb ?? ph.file)!} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
