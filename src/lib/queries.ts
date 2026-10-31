import { and, asc, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "./db";

const { events, bookings, media, albums } = schema;

export type EventFilters = { activity?: string; difficulty?: string; zone?: string; q?: string };

const booked = sql<number>`coalesce((select sum(${bookings.participantCount}) from ${bookings} where ${bookings.eventId} = ${events.id} and ${bookings.status} <> 'CANCELLED'), 0)::int`;

export async function getUpcomingEvents(f: EventFilters = {}, limit = 60) {
  const conds = [eq(events.published, true), gte(events.startsAt, sql`now() - interval '6 hours'`)];
  if (f.activity && ["HIKE", "BOOTCAMP", "RUN_CHALLENGE"].includes(f.activity)) conds.push(eq(events.activity, f.activity as "HIKE"));
  if (f.difficulty && ["EASY", "MODERATE", "DIFFICULT"].includes(f.difficulty)) conds.push(eq(events.difficulty, f.difficulty as "EASY"));
  if (f.zone && ["NEAR_NAIROBI", "OUT_OF_NAIROBI", "VIRTUAL"].includes(f.zone)) conds.push(eq(events.zone, f.zone as "VIRTUAL"));
  if (f.q?.trim()) {
    const q = `%${f.q.trim().slice(0, 60)}%`;
    conds.push(or(ilike(events.title, q), ilike(events.region, q), ilike(events.summary, q))!);
  }
  return db
    .select({ event: events, booked, coverFile: media.file, coverThumb: media.thumb, coverBlur: media.blur })
    .from(events)
    .leftJoin(media, eq(media.id, events.coverMediaId))
    .where(and(...conds))
    .orderBy(asc(events.startsAt))
    .limit(limit);
}

export type EventRow = Awaited<ReturnType<typeof getUpcomingEvents>>[number];

export async function getEventBySlug(slug: string) {
  const [row] = await db
    .select({ event: events, booked, coverFile: media.file, coverThumb: media.thumb, coverBlur: media.blur })
    .from(events)
    .leftJoin(media, eq(media.id, events.coverMediaId))
    .where(and(eq(events.slug, slug), eq(events.published, true)))
    .limit(1);
  return row ?? null;
}

export async function getAlbums(limit = 50) {
  return db
    .select({
      album: albums,
      coverFile: media.file, coverThumb: media.thumb, coverBlur: media.blur,
      count: sql<number>`(select count(*) from ${media} m2 where m2.album_id = ${albums.id})::int`,
    })
    .from(albums)
    .leftJoin(media, eq(media.id, albums.coverMediaId))
    .where(eq(albums.published, true))
    .orderBy(desc(albums.date))
    .limit(limit);
}

export async function getAlbumBySlug(slug: string) {
  const [album] = await db.select().from(albums).where(and(eq(albums.slug, slug), eq(albums.published, true))).limit(1);
  if (!album) return null;
  const items = await db.select().from(media).where(eq(media.albumId, album.id)).orderBy(asc(media.sortOrder), asc(media.createdAt));
  return { album, items };
}

export async function getRecentPhotos(limit = 8) {
  return db
    .select({ id: media.id, file: media.file, thumb: media.thumb, blur: media.blur, caption: media.caption, alt: media.alt, width: media.width, height: media.height, albumSlug: albums.slug })
    .from(media)
    .innerJoin(albums, eq(albums.id, media.albumId))
    .where(and(eq(albums.published, true), eq(media.kind, "IMAGE")))
    .orderBy(desc(media.createdAt))
    .limit(limit);
}

export async function getStats() {
  const [r] = await db.execute<{ hikers: number; events: number; albums: number }>(sql`
    select
      coalesce((select sum(participant_count) from bookings where status <> 'CANCELLED'),0)::int as hikers,
      (select count(*) from events where published and starts_at < now())::int as events,
      (select count(*) from media)::int as albums`);
  return r;
}

