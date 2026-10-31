import Link from "next/link";
import type { Metadata } from "next";
import { getAlbums } from "@/lib/queries";
import { Photo } from "@/components/Photo";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Memories", description: "Real photos and videos from Peak Pals hikes, bootcamps and challenges." };

export default async function MemoriesPage() {
  const albums = await getAlbums();
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0", "-rotate-[1.5deg]"];
  return (
    <div className="topo min-h-[60vh]">
      <section className="wrap pb-6 pt-14">
        <p className="kicker">The field journal</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Memories</h1>
        <p className="mt-3 max-w-2xl text-lg text-moss">Every photo here is real, taken by our crew on the trail with the people who were there. Open an album to relive the day.</p>
      </section>
      <section className="wrap py-10">
        {albums.length ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map(({ album, coverFile, coverThumb, coverBlur, count }, i) => (
              <Link key={album.id} href={`/memories/${album.slug}`} className={`reveal relative block rounded-md border-2 border-night bg-paper p-3 pb-5 shadow-[6px_6px_0_#1F3320] transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 ${tilt[i % tilt.length]}`}>
                <span className="tape" aria-hidden />
                <div className="aspect-[4/3] overflow-hidden rounded-sm border-2 border-night bg-forest">
                  {coverFile && <Photo file={coverFile} thumb={coverThumb} blur={coverBlur} alt="" className="size-full object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />}
                </div>
                <div className="mt-4 flex items-start justify-between gap-3 px-1">
                  <div>
                    <h2 className="text-2xl">{album.title}</h2>
                    <p className="mt-1 font-display text-sm font-bold text-brown">{fmtDate(album.date, { day: "numeric", month: "long", year: "numeric" })}{album.location ? ` · ${album.location}` : ""}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-forest px-3 py-1 font-display text-sm font-bold text-cream">{count} {count === 1 ? "item" : "items"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="sticker bg-cream p-10 text-center"><p className="font-display text-2xl font-bold text-forest">The first album is coming soon.</p></div>
        )}
      </section>
    </div>
  );
}
