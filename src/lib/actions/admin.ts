"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "../db";
import { createSession, destroySession, requireAdmin } from "../auth";
import { deleteMedia } from "../media";
import { fromNairobiLocal, slugify } from "../format";
import { rateLimit } from "../ratelimit";
import type { FormState } from "./public";

const { events, bookings, albums, media, enquiries, subscribers, users } = schema;

let dummyHash: string | null = null;
async function dummy() {
  return (dummyHash ??= await bcrypt.hash("not-a-real-password", 12));
}

export async function login(_p: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000) || !rateLimit(`login:${email}`, 8, 15 * 60_000)) {
    return { ok: false, message: "Too many sign-in attempts. Wait 15 minutes and try again." };
  }
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const valid = u ? await bcrypt.compare(password, u.passwordHash) : await bcrypt.compare(password, await dummy());
  if (!u || !valid) return { ok: false, message: "That email and password don't match." };
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, u.id));
  await createSession({ sub: u.id, email: u.email, name: u.name });
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_p: FormState, fd: FormData): Promise<FormState> {
  const s = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < 10) return { ok: false, message: "Use at least 10 characters for the new password." };
  if (next !== String(fd.get("confirm") ?? "")) return { ok: false, message: "The new passwords don't match." };
  const [u] = await db.select().from(users).where(eq(users.id, s.sub)).limit(1);
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { ok: false, message: "Your current password is incorrect." };
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(users.id, u.id));
  return { ok: true, message: "Password updated." };
}

export async function createAdminUser(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().toLowerCase().email(), password: z.string().min(10) })
    .safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, message: "Add a name, a valid email and a password of at least 10 characters." };
  const r = await db.insert(users).values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 12) }).onConflictDoNothing().returning();
  if (!r.length) return { ok: false, message: "An admin with that email already exists." };
  revalidatePath("/admin/settings");
  return { ok: true, message: `Admin account created for ${parsed.data.email}.` };
}

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20);
const num = (v: FormDataEntryValue | null) => { const s = String(v ?? "").trim(); return s === "" ? undefined : s; };

const eventSchema = z.object({
  title: z.string().trim().min(3, "Add a title").max(160),
  activity: z.enum(["HIKE", "BOOTCAMP", "RUN_CHALLENGE"]),
  difficulty: z.enum(["EASY", "MODERATE", "DIFFICULT"]),
  zone: z.enum(["NEAR_NAIROBI", "OUT_OF_NAIROBI", "VIRTUAL"]),
  region: z.string().trim().min(2, "Add a location").max(160),
  meetingPoint: z.string().trim().min(2, "Add a meeting point").max(200),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Pick a date and time"),
  durationHours: z.coerce.number().positive().max(2000).optional(),
  distanceKm: z.coerce.number().positive().max(1000).optional(),
  elevationGainM: z.coerce.number().int().min(0).max(9000).optional(),
  highestPointM: z.coerce.number().int().min(0).max(9000).optional(),
  priceKes: z.coerce.number({ invalid_type_error: "Add a price" }).int().min(0).max(10_000_000),
  capacity: z.coerce.number({ invalid_type_error: "Add the number of spots" }).int().min(1, "At least 1 spot").max(10000),
  guideRatio: z.string().trim().max(60).optional(),
  instructor: z.string().trim().max(120).optional(),
  summary: z.string().trim().min(10, "Write a one-line summary").max(280),
  description: z.string().trim().min(20, "Write a description").max(10000),
  coverMediaId: z.string().uuid().optional(),
});

export async function saveEvent(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const parsed = eventSchema.safeParse({
    title: fd.get("title"), activity: fd.get("activity"), difficulty: fd.get("difficulty"), zone: fd.get("zone"),
    region: fd.get("region"), meetingPoint: fd.get("meetingPoint"), startsAt: fd.get("startsAt"),
    durationHours: num(fd.get("durationHours")), distanceKm: num(fd.get("distanceKm")), elevationGainM: num(fd.get("elevationGainM")),
    highestPointM: num(fd.get("highestPointM")), priceKes: fd.get("priceKes"), capacity: fd.get("capacity"),
    guideRatio: num(fd.get("guideRatio")), instructor: num(fd.get("instructor")), summary: fd.get("summary"), description: fd.get("description"),
    coverMediaId: num(fd.get("coverMediaId")),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;
  let slug = slugify(String(fd.get("slug") ?? "") || d.title);
  for (let n = 2; ; n++) {
    const clash = await db.select({ id: events.id }).from(events).where(id ? and(eq(events.slug, slug), ne(events.id, id)) : eq(events.slug, slug)).limit(1);
    if (!clash.length) break;
    slug = `${slugify(String(fd.get("slug") ?? "") || d.title)}-${n}`;
  }
  const values = {
    ...d, slug, startsAt: fromNairobiLocal(d.startsAt),
    durationHours: d.durationHours ?? null, distanceKm: d.distanceKm ?? null, elevationGainM: d.elevationGainM ?? null, highestPointM: d.highestPointM ?? null,
    guideRatio: d.guideRatio ?? null, instructor: d.instructor ?? null, coverMediaId: d.coverMediaId ?? null,
    inclusions: lines(fd.get("inclusions")), bring: lines(fd.get("bring")), published: fd.get("published") === "on", updatedAt: new Date(),
  };
  if (id) {
    await db.update(events).set(values).where(eq(events.id, id));
  } else {
    await db.insert(events).values(values);
  }
  revalidatePath("/", "layout");
  redirect(`/admin/events?saved=${encodeURIComponent(d.title)}`);
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/events?deleted=1");
}

export async function setBookingStatus(fd: FormData) {
  await requireAdmin();
  const status = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).parse(fd.get("status"));
  await db.update(bookings).set({ status }).where(eq(bookings.id, String(fd.get("id"))));
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

const albumSchema = z.object({
  title: z.string().trim().min(3, "Add a title").max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  location: z.string().trim().max(160).optional(),
  story: z.string().trim().max(4000).optional(),
  guideNote: z.string().trim().max(200).optional(),
  eventId: z.string().uuid().optional(),
});

export async function saveAlbum(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const parsed = albumSchema.safeParse({
    title: fd.get("title"), date: fd.get("date"), location: num(fd.get("location")), story: num(fd.get("story")),
    guideNote: num(fd.get("guideNote")), eventId: num(fd.get("eventId")),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;
  const values = { ...d, date: new Date(`${d.date}T12:00:00+03:00`), location: d.location ?? null, story: d.story ?? null, guideNote: d.guideNote ?? null, eventId: d.eventId ?? null, published: fd.get("published") === "on" };
  let albumId = id;
  if (id) {
    await db.update(albums).set(values).where(eq(albums.id, id));
  } else {
    let slug = slugify(d.title);
    for (let n = 2; (await db.select({ id: albums.id }).from(albums).where(eq(albums.slug, slug)).limit(1)).length; n++) slug = `${slugify(d.title)}-${n}`;
    const [row] = await db.insert(albums).values({ ...values, slug }).returning({ id: albums.id });
    albumId = row.id;
  }
  revalidatePath("/memories", "layout");
  revalidatePath("/");
  if (!id) redirect(`/admin/memories/${albumId}?created=1`);
  return { ok: true, message: "Album saved." };
}

export async function deleteAlbum(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const items = await db.select({ id: media.id }).from(media).where(eq(media.albumId, id));
  for (const m of items) await deleteMedia(m.id);
  await db.delete(albums).where(eq(albums.id, id));
  revalidatePath("/memories", "layout");
  redirect("/admin/memories?deleted=1");
}

export async function updateMedia(fd: FormData) {
  await requireAdmin();
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 200) || null;
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 300) || null;
  await db.update(media).set({ caption, alt }).where(eq(media.id, String(fd.get("id"))));
  revalidatePath("/memories", "layout");
}

export async function removeMedia(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await db.update(albums).set({ coverMediaId: null }).where(eq(albums.coverMediaId, id));
  await deleteMedia(id);
  revalidatePath("/memories", "layout");
  revalidatePath("/admin/memories", "layout");
}

export async function setAlbumCover(fd: FormData) {
  await requireAdmin();
  await db.update(albums).set({ coverMediaId: String(fd.get("mediaId")) }).where(eq(albums.id, String(fd.get("albumId"))));
  revalidatePath("/memories", "layout");
  revalidatePath("/admin/memories", "layout");
}

export async function setEnquiryStatus(fd: FormData) {
  await requireAdmin();
  const status = z.enum(["NEW", "CONTACTED", "CLOSED"]).parse(fd.get("status"));
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, String(fd.get("id"))));
  revalidatePath("/admin/enquiries");
}

export async function removeSubscriber(fd: FormData) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, String(fd.get("id"))));
  revalidatePath("/admin/subscribers");
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Add a product name").max(160),
  category: z.enum(["Apparel", "Headwear", "Gear", "Accessories"]),
  art: z.enum(["tee", "hoodie", "cap", "bottle", "buff", "tote"]),
  summary: z.string().trim().min(10, "Write a short summary").max(200),
  description: z.string().trim().max(5000).optional(),
  priceKes: z.coerce.number({ invalid_type_error: "Add a price" }).int().min(0).max(10_000_000),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  images: z.array(z.string().uuid()).max(12),
});

const csvList = (v: FormDataEntryValue | null) => [...new Set(String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20).map((s) => s.slice(0, 40));

export async function saveProduct(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const parsed = productSchema.safeParse({
    name: fd.get("name"), category: fd.get("category"), art: fd.get("art"), summary: fd.get("summary"),
    description: num(fd.get("description")), priceKes: fd.get("priceKes"), sortOrder: num(fd.get("sortOrder")),
    images: fd.getAll("images").map(String).filter(Boolean),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;
  const { products } = schema;
  const base = slugify(String(fd.get("slug") ?? "") || d.name);
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await db.select({ id: products.id }).from(products).where(id ? and(eq(products.slug, slug), ne(products.id, id)) : eq(products.slug, slug)).limit(1);
    if (!clash.length) break;
    slug = `${base}-${n}`;
  }
  const values = {
    ...d, slug, description: d.description ?? "", sortOrder: d.sortOrder ?? 0,
    sizes: csvList(fd.get("sizes")), colors: csvList(fd.get("colors")),
    inStock: fd.get("inStock") === "on", featured: fd.get("featured") === "on", published: fd.get("published") === "on", updatedAt: new Date(),
  };
  if (id) {
    const [old] = await db.select({ images: products.images }).from(products).where(eq(products.id, id)).limit(1);
    await db.update(products).set(values).where(eq(products.id, id));
    for (const m of (old?.images ?? []).filter((x) => !d.images.includes(x))) await deleteMedia(m);
  } else {
    await db.insert(products).values(values);
  }
  revalidatePath("/", "layout");
  redirect(`/admin/merch?saved=${encodeURIComponent(d.name)}`);
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const [row] = await db.delete(schema.products).where(eq(schema.products.id, id)).returning({ images: schema.products.images });
  for (const m of row?.images ?? []) await deleteMedia(m);
  revalidatePath("/", "layout");
  redirect("/admin/merch?deleted=1");
}

export async function setMerchOrderStatus(fd: FormData) {
  await requireAdmin();
  const status = z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED"]).parse(fd.get("status"));
  await db.update(schema.merchOrders).set({ status }).where(eq(schema.merchOrders.id, String(fd.get("id"))));
  revalidatePath("/admin/merch/orders");
  revalidatePath("/admin");
}
