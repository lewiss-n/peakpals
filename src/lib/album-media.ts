import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "./db";

export async function albumExists(albumId: string) {
  const [a] = await db.select({ id: schema.albums.id }).from(schema.albums).where(eq(schema.albums.id, albumId)).limit(1);
  return !!a;
}

export async function nextSortOrder(albumId: string | null) {
  if (!albumId) return 0;
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${schema.media.sortOrder}), -1)::int` }).from(schema.media).where(eq(schema.media.albumId, albumId));
  return max + 1;
}

/** Gives the album a cover if it has none yet, and refreshes the public pages. */
export async function afterAlbumUpload(albumId: string | null, firstImageId?: string) {
  if (!albumId) return;
  if (firstImageId) {
    await db.update(schema.albums).set({ coverMediaId: sql`coalesce(${schema.albums.coverMediaId}, ${firstImageId}::uuid)` }).where(eq(schema.albums.id, albumId));
  }
  revalidatePath("/memories", "layout");
  revalidatePath("/");
}
