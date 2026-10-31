import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { EventForm } from "@/components/admin/EventForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteEvent } from "@/lib/actions/admin";
import { mediaUrl } from "@/lib/media-url";
import { toNairobiLocal } from "@/lib/format";

export const metadata = { title: "Edit event" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [row] = await db.select({ e: schema.events, cover: schema.media.thumb }).from(schema.events)
    .leftJoin(schema.media, eq(schema.media.id, schema.events.coverMediaId)).where(eq(schema.events.id, id)).limit(1);
  if (!row) notFound();
  const e = row.e;
  return (
    <div>
      <p className="kicker">Events</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-1 text-4xl">Edit: {e.title}</h1>
        <DeleteButton action={deleteEvent} id={e.id} label="Delete event" confirmText="Delete this event and all its bookings?" />
      </div>
      <EventForm initial={{
        id: e.id, title: e.title, slug: e.slug, activity: e.activity, difficulty: e.difficulty, zone: e.zone, region: e.region,
        meetingPoint: e.meetingPoint, startsAt: toNairobiLocal(e.startsAt), durationHours: e.durationHours?.toString() ?? "",
        distanceKm: e.distanceKm?.toString() ?? "", elevationGainM: e.elevationGainM?.toString() ?? "", highestPointM: e.highestPointM?.toString() ?? "",
        priceKes: String(e.priceKes), capacity: String(e.capacity), guideRatio: e.guideRatio ?? "", instructor: e.instructor ?? "",
        summary: e.summary, description: e.description, inclusions: e.inclusions.join("\n"), bring: e.bring.join("\n"),
        published: e.published, coverMediaId: e.coverMediaId ?? "", coverUrl: mediaUrl(row.cover) ?? "",
      }} />
    </div>
  );
}
