/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { mediaUrl } from "@/lib/media-url";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Memories" };

export default async function AdminMemories({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const sp = await searchParams;
  const { albums, media } = schema;
  const rows = await db.select({ a: albums, cover: media.thumb, n: sql<number>`(select count(*) from ${media} m where m.album_id = ${albums.id})::int` })
    .from(albums).leftJoin(media, eq(media.id, albums.coverMediaId)).orderBy(desc(albums.date));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Photos &amp; videos</p><h1 className="mt-1 text-4xl">Memories</h1></div>
        <Link href="/admin/memories/new" className="btn btn-gold"><Icon name="plus" className="size-5" />New album</Link>
      </div>
      {sp.deleted && <p role="status" className="rounded-2xl border-2 border-brown/40 bg-brown/10 p-3 font-semibold">Album deleted.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ a, cover, n }) => (
          <Link key={a.id} href={`/admin/memories/${a.id}`} className="sticker sticker-hover overflow-hidden bg-white">
            <div className="aspect-[4/3] border-b-2 border-night bg-cream">{cover ? <img src={mediaUrl(cover)!} alt="" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-moss"><Icon name="camera" className="size-10" /></div>}</div>
            <div className="p-4">
              <p className="font-display text-xl font-bold text-forest">{a.title}</p>
              <p className="text-sm text-moss">{fmtDate(a.date, { day: "numeric", month: "short", year: "numeric" })} · {n} item{n === 1 ? "" : "s"} · {a.published ? "Live" : "Hidden"}</p>
            </div>
          </Link>
        ))}
        {!rows.length && <p className="sticker bg-white p-10 text-center text-moss sm:col-span-3">No albums yet. Create one and drop in your photos.</p>}
      </div>
    </div>
  );
}
