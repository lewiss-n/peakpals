/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AlbumForm } from "@/components/admin/AlbumForm";
import { Uploader } from "@/components/admin/Uploader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteAlbum, removeMedia, setAlbumCover, updateMedia } from "@/lib/actions/admin";
import { mediaUrl } from "@/lib/media-url";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit album" };

export default async function EditAlbum({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [a] = await db.select().from(schema.albums).where(eq(schema.albums.id, id)).limit(1);
  if (!a) notFound();
  const items = await db.select().from(schema.media).where(eq(schema.media.albumId, id)).orderBy(asc(schema.media.sortOrder), asc(schema.media.createdAt));
  const evs = await db.select({ id: schema.events.id, title: schema.events.title, startsAt: schema.events.startsAt }).from(schema.events).orderBy(desc(schema.events.startsAt)).limit(100);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/memories" className="inline-flex items-center gap-1 font-display text-sm font-bold text-forest hover:text-orange"><Icon name="arrow" className="size-4 rotate-180" />All albums</Link>
          <h1 className="mt-1 text-4xl">{a.title}</h1>
          <Link href={`/memories/${a.slug}`} target="_blank" className="text-sm font-semibold underline">View on website</Link>
        </div>
        <DeleteButton action={deleteAlbum} id={a.id} label="Delete album" confirmText="Delete this album and all its photos?" />
      </div>
      {sp.created && <p role="status" className="rounded-2xl border-2 border-olive bg-olive/15 p-3 font-semibold">Album created. Now add your photos and videos.</p>}

      <section className="sticker bg-white p-6">
        <h2 className="text-2xl">Add photos &amp; videos</h2>
        <p className="mt-1 text-sm text-moss">Only real photos from Peak Pals events, of people who gave photo consent when booking. Photos are resized and optimised automatically (up to 25 MB each). Videos: MP4, WebM or MOV up to 200 MB.</p>
        <Uploader albumId={a.id} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl">In this album ({items.length})</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="sticker overflow-hidden bg-white">
              <div className="relative aspect-[4/3] border-b-2 border-night bg-night">
                {m.kind === "IMAGE" ? <img src={mediaUrl(m.thumb ?? m.file)!} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" /> : <video src={mediaUrl(m.file)!} controls preload="metadata" className="size-full object-cover" />}
                {a.coverMediaId === m.id && <span className="absolute left-2 top-2 rounded-full bg-gold px-3 py-1 font-display text-xs font-bold">Album cover</span>}
              </div>
              <form action={updateMedia} className="flex flex-col gap-2 p-4">
                <input type="hidden" name="id" value={m.id} />
                <label className="sr-only" htmlFor={`cap-${m.id}`}>Caption</label>
                <input id={`cap-${m.id}`} name="caption" defaultValue={m.caption ?? ""} placeholder="Caption (shown on the site)" className="field !min-h-10 !py-2 text-sm" />
                {m.kind === "IMAGE" && <><label className="sr-only" htmlFor={`alt-${m.id}`}>Description for screen readers</label>
                <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt ?? ""} placeholder="Describe the photo (for accessibility)" className="field !min-h-10 !py-2 text-sm" /></>}
                <button className="btn btn-ghost !min-h-9 !py-1 text-sm">Save text</button>
              </form>
              <div className="flex items-center justify-between border-t border-night/10 px-4 py-3">
                {m.kind === "IMAGE" && a.coverMediaId !== m.id ? (
                  <form action={setAlbumCover}><input type="hidden" name="albumId" value={a.id} /><input type="hidden" name="mediaId" value={m.id} /><button className="font-display text-sm font-bold text-forest hover:text-orange">Make cover</button></form>
                ) : <span />}
                <DeleteButton action={removeMedia} id={m.id} label="Remove" confirmText="Remove?" />
              </div>
            </li>
          ))}
        </ul>
        {!items.length && <p className="sticker bg-white p-8 text-center text-moss">No photos yet. Drop some in above.</p>}
      </section>

      <section>
        <h2 className="mb-2 text-2xl">Album details</h2>
        <AlbumForm events={evs.map((e) => ({ id: e.id, label: `${e.startsAt.toISOString().slice(0, 10)} · ${e.title}` }))}
          initial={{ id: a.id, title: a.title, date: a.date.toISOString().slice(0, 10), location: a.location ?? "", story: a.story ?? "", guideNote: a.guideNote ?? "", eventId: a.eventId ?? "", published: a.published }} />
      </section>
    </div>
  );
}
