import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AlbumForm } from "@/components/admin/AlbumForm";

export const metadata = { title: "New album" };

export default async function NewAlbum() {
  const evs = await db.select({ id: schema.events.id, title: schema.events.title, startsAt: schema.events.startsAt }).from(schema.events).orderBy(desc(schema.events.startsAt)).limit(100);
  return (
    <div>
      <p className="kicker">Memories</p>
      <h1 className="mt-1 text-4xl">New album</h1>
      <p className="mt-2 text-moss">Create the album first, then add photos and videos on the next screen.</p>
      <AlbumForm events={evs.map((e) => ({ id: e.id, label: `${e.startsAt.toISOString().slice(0, 10)} · ${e.title}` }))} />
    </div>
  );
}
