"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, schema } from "../db";
import { rateLimit } from "../ratelimit";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string>; data?: Record<string, unknown> };

async function clientKey() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}

const phone = z.string().trim().min(9, "Enter a phone number we can reach you on").max(40).regex(/^[+\d][\d\s()-]{7,}$/, "Enter a valid phone number");

const bookingSchema = z.object({
  eventId: z.string().uuid(),
  leadName: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  phone,
  participants: z.array(z.object({
    name: z.string().trim().min(2, "Add a name for each participant").max(120),
    age: z.coerce.number({ invalid_type_error: "Add an age" }).int().min(13, "Participants must be 13 or older").max(100, "Check the age"),
  })).min(1).max(10),
  guardianName: z.string().trim().max(120).optional(),
  guardianPhone: z.string().trim().max(40).optional(),
  guardianConsent: z.boolean(),
  photoConsent: z.boolean(),
  dataConsent: z.literal(true, { errorMap: () => ({ message: "Please agree to how we handle your data" }) }),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to book" }) }),
  notes: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function createBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!rateLimit(`book:${await clientKey()}`, 8, 10 * 60_000)) return { ok: false, message: "Too many attempts. Please wait a few minutes and try again." };
  const names = fd.getAll("pname").map(String);
  const ages = fd.getAll("page").map(String);
  const parsed = bookingSchema.safeParse({
    eventId: fd.get("eventId"),
    leadName: fd.get("leadName"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    participants: names.map((n, i) => ({ name: n, age: ages[i] })),
    guardianName: (fd.get("guardianName") as string) || undefined,
    guardianPhone: (fd.get("guardianPhone") as string) || undefined,
    guardianConsent: fd.get("guardianConsent") === "on",
    photoConsent: fd.get("photoConsent") === "on",
    dataConsent: fd.get("dataConsent") === "on",
    termsAccepted: fd.get("termsAccepted") === "on",
    notes: (fd.get("notes") as string) || undefined,
    website: (fd.get("website") as string) || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] === "participants" ? `participants.${i.path[1] ?? 0}.${i.path[2] ?? "name"}` : String(i.path[0]);
      errors[k] ??= i.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const d = parsed.data;
  const hasMinors = d.participants.some((p) => p.age < 18);
  if (hasMinors) {
    const errors: Record<string, string> = {};
    if (!d.guardianName || d.guardianName.length < 2) errors.guardianName = "A parent or guardian's name is required for participants under 18";
    if (!d.guardianPhone || !/^[+\d][\d\s()-]{7,}$/.test(d.guardianPhone)) errors.guardianPhone = "Add the parent or guardian's phone number";
    if (!d.guardianConsent) errors.guardianConsent = "Parent or guardian consent is required";
    if (Object.keys(errors).length) return { ok: false, message: "Participants under 18 need parent or guardian consent.", errors };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [ev] = await tx.execute<{ id: string; capacity: number; price_kes: number; title: string; starts_at: Date; published: boolean }>(
        sql`select id, capacity, price_kes, title, starts_at, published from events where id = ${d.eventId} for update`);
      if (!ev || !ev.published) return { error: "This event is no longer available." };
      if (new Date(ev.starts_at).getTime() < Date.now() - 6 * 3600e3) return { error: "This event has already taken place." };
      const [{ taken }] = await tx.execute<{ taken: number }>(
        sql`select coalesce(sum(participant_count),0)::int as taken from bookings where event_id = ${d.eventId} and status <> 'CANCELLED'`);
      const left = ev.capacity - taken;
      if (d.participants.length > left) return { error: left > 0 ? `Only ${left} spot${left === 1 ? "" : "s"} left. Reduce the number of participants.` : "Sorry, this event just filled up." };
      const reference = "PP-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
      const total = ev.price_kes * d.participants.length;
      await tx.insert(schema.bookings).values({
        reference, eventId: d.eventId, leadName: d.leadName, email: d.email, phone: d.phone,
        participants: d.participants, participantCount: d.participants.length, hasMinors,
        guardianName: hasMinors ? d.guardianName : null, guardianPhone: hasMinors ? d.guardianPhone : null,
        guardianConsent: hasMinors ? d.guardianConsent : false, photoConsent: d.photoConsent,
        dataConsent: true, termsAccepted: true, notes: d.notes ?? null, totalKes: total,
      });
      return { reference, total, title: ev.title, count: d.participants.length };
    });
    if ("error" in result) return { ok: false, message: result.error };
    revalidatePath("/events");
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (e) {
    console.error("booking failed", e);
    return { ok: false, message: "Something went wrong saving your booking. Please try again." };
  }
}

export async function subscribe(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "You're on the list!" };
  if (!rateLimit(`sub:${await clientKey()}`, 6, 10 * 60_000)) return { ok: false, message: "Too many attempts. Try again later." };
  const email = z.string().trim().toLowerCase().email().max(255).safeParse(fd.get("email"));
  if (!email.success) return { ok: false, message: "Enter a valid email address." };
  await db.insert(schema.subscribers).values({ email: email.data }).onConflictDoNothing();
  return { ok: true, message: "You're on the list! New adventures will land in your inbox." };
}

const enquirySchema = z.object({
  organisation: z.string().trim().min(2, "Add your company or group name").max(160),
  contactName: z.string().trim().min(2, "Add a contact name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional(),
  groupSize: z.coerce.number().int().min(2, "Groups start at 2 people").max(5000).optional(),
  preferredDate: z.string().trim().max(60).optional(),
  interests: z.array(z.string().max(40)).max(6),
  message: z.string().trim().max(2000).optional(),
  dataConsent: z.literal(true, { errorMap: () => ({ message: "Please agree so we can contact you" }) }),
});

export async function createEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true };
  if (!rateLimit(`enq:${await clientKey()}`, 5, 10 * 60_000)) return { ok: false, message: "Too many attempts. Try again later." };
  const parsed = enquirySchema.safeParse({
    organisation: fd.get("organisation"), contactName: fd.get("contactName"), email: fd.get("email"),
    phone: (fd.get("phone") as string) || undefined, groupSize: (fd.get("groupSize") as string) || undefined,
    preferredDate: (fd.get("preferredDate") as string) || undefined, interests: fd.getAll("interests").map(String),
    message: (fd.get("message") as string) || undefined, dataConsent: fd.get("dataConsent") === "on",
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const { dataConsent: _c, ...v } = parsed.data;
  await db.insert(schema.enquiries).values(v);
  return { ok: true, message: "Thanks! We'll get back to you within two working days." };
}


const orderSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().trim().max(20).optional(),
  color: z.string().trim().max(40).optional(),
  quantity: z.coerce.number().int().min(1, "Order at least 1").max(20, "For more than 20, please contact us"),
  name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  phone,
  delivery: z.enum(["PICKUP_EVENT", "DELIVERY_NAIROBI", "COURIER"], { errorMap: () => ({ message: "Choose how you'd like to get it" }) }),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
  dataConsent: z.literal(true, { errorMap: () => ({ message: "Please agree to how we handle your data" }) }),
});

export async function createMerchOrder(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: false, message: "Something went wrong." };
  if (!rateLimit(`merch:${await clientKey()}`, 8, 10 * 60_000)) return { ok: false, message: "Too many attempts. Please wait a few minutes and try again." };
  const parsed = orderSchema.safeParse({
    productId: fd.get("productId"), size: (fd.get("size") as string) || undefined, color: (fd.get("color") as string) || undefined,
    quantity: fd.get("quantity"), name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), delivery: fd.get("delivery"),
    address: (fd.get("address") as string) || undefined, notes: (fd.get("notes") as string) || undefined, dataConsent: fd.get("dataConsent") === "on",
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const d = parsed.data;
  const [p] = await db.select().from(schema.products).where(sql`${schema.products.id} = ${d.productId}`).limit(1);
  if (!p || !p.published) return { ok: false, message: "This item is no longer available." };
  if (!p.inStock) return { ok: false, message: "Sorry, this item is currently sold out." };
  const errors: Record<string, string> = {};
  if (p.sizes.length && (!d.size || !p.sizes.includes(d.size))) errors.size = "Pick a size";
  if (p.colors.length && (!d.color || !p.colors.includes(d.color))) errors.color = "Pick a colour";
  if (d.delivery !== "PICKUP_EVENT" && (!d.address || d.address.length < 5)) errors.address = "Add a delivery address or area";
  if (Object.keys(errors).length) return { ok: false, message: "Please check the highlighted fields.", errors };
  const reference = "PM-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  const total = p.priceKes * d.quantity;
  await db.insert(schema.merchOrders).values({
    reference, productId: p.id, productName: p.name, size: d.size ?? null, color: d.color ?? null, quantity: d.quantity,
    unitPriceKes: p.priceKes, totalKes: total, name: d.name, email: d.email, phone: d.phone, delivery: d.delivery,
    address: d.delivery === "PICKUP_EVENT" ? null : d.address ?? null, notes: d.notes ?? null,
  });
  return { ok: true, data: { reference, total, name: p.name, quantity: d.quantity } };
}
