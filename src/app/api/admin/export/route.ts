import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

const csv = (rows: (string | number | null | undefined)[][]) =>
  "﻿" + rows.map((r) => r.map((c) => {
    let s = c == null ? "" : String(c);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // avoid spreadsheet formula injection
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\r\n");

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  let body = "";
  let name = "export";
  if (type === "bookings") {
    const eventId = url.searchParams.get("eventId");
    const q = db.select({ b: schema.bookings, title: schema.events.title, startsAt: schema.events.startsAt }).from(schema.bookings)
      .innerJoin(schema.events, eq(schema.events.id, schema.bookings.eventId));
    const rows = await (eventId ? q.where(eq(schema.bookings.eventId, eventId)) : q).orderBy(desc(schema.bookings.createdAt));
    body = csv([
      ["Reference", "Event", "Event date", "Status", "Lead name", "Email", "Phone", "Participants", "Ages", "Count", "Total KES", "Under 18", "Guardian", "Guardian phone", "Guardian consent", "Photo consent", "Notes", "Booked at"],
      ...rows.map(({ b, title, startsAt }) => [b.reference, title, startsAt.toISOString(), b.status, b.leadName, b.email, b.phone,
        b.participants.map((p) => p.name).join("; "), b.participants.map((p) => p.age).join("; "), b.participantCount, b.totalKes,
        b.hasMinors ? "yes" : "no", b.guardianName, b.guardianPhone, b.guardianConsent ? "yes" : "no", b.photoConsent ? "yes" : "no", b.notes, b.createdAt.toISOString()]),
    ]);
    name = "bookings";
  } else if (type === "subscribers") {
    const rows = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
    body = csv([["Email", "Subscribed at"], ...rows.map((r) => [r.email, r.createdAt.toISOString()])]);
    name = "subscribers";
  } else if (type === "merch") {
    const rows = await db.select().from(schema.merchOrders).orderBy(desc(schema.merchOrders.createdAt));
    body = csv([["Reference", "Status", "Item", "Size", "Colour", "Qty", "Unit KES", "Total KES", "Name", "Email", "Phone", "Delivery", "Address", "Notes", "Ordered at"],
      ...rows.map((o) => [o.reference, o.status, o.productName, o.size, o.color, o.quantity, o.unitPriceKes, o.totalKes, o.name, o.email, o.phone, o.delivery, o.address, o.notes, o.createdAt.toISOString()])]);
    name = "merch-orders";
  } else {
    return NextResponse.json({ error: "Unknown export" }, { status: 400 });
  }
  return new NextResponse(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="peak-pals-${name}-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
