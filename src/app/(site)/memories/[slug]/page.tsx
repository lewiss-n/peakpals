import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAlbumBySlug } from "@/lib/queries";
import { fmtDate } from "@/lib/format";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await getAlbumBySlug((await params).slug);
  return r ? { title: `${r.album.title} · Memories`, description: r.album.story ?? undefined } : { title: "Album not found" };
}

export default async function AlbumPage({ params }: { params: Params }) {
  const r = await getAlbumBySlug((await params).slug);
  if (!r) notFound();
  const { album, items } = r;
  return (
    <div className="topo">
      <section className="wrap pb-8 pt-12">
        <Link href="/memories" className="inline-flex items-center gap-2 font-display font-bold text-forest hover:text-orange"><Icon name="arrow" className="size-4 rotate-180" />All memories</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="kicker">{fmtDate(album.date, { day: "numeric", month: "long", year: "numeric" })}{album.location ? ` · ${album.location}` : ""}</p>
            <h1 className="mt-2 text-5xl sm:text-6xl">{album.title}</h1>
            {album.story && <p className="mt-4 max-w-2xl text-lg">{album.story}</p>}
          </div>
          {album.guideNote && (
            <div className="sticker -rotate-1 border-dashed bg-cream p-5">
              <p className="font-display text-sm font-bold text-moss">Guide&apos;s note</p>
              <p className="hand mt-1 text-3xl leading-tight text-brown">{album.guideNote}</p>
            </div>
          )}
        </div>
      </section>
      <section className="wrap pb-10">
        <Gallery items={items.map((m) => ({ id: m.id, kind: m.kind, file: m.file, thumb: m.thumb, blur: m.blur, caption: m.caption, alt: m.alt, width: m.width, height: m.height, mime: m.mime }))} />
      </section>
    </div>
  );
}
