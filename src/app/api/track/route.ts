import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

const BOT = /bot|crawl|spider|slurp|bing|headless|lighthouse|preview|facebookexternalhit|whatsapp|monitor|curl|wget|python|axios/i;

function device(ua: string, w?: number) {
  if (/ipad|tablet/i.test(ua) || (w && w >= 640 && w < 1024 && /mobile|android/i.test(ua))) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}
function browser(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua) || req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return new NextResponse(null, { status: 204 });
  let body: { path?: string; referrer?: string; utm?: string; w?: number };
  try { body = await req.json(); } catch { return new NextResponse(null, { status: 400 }); }
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
  if (!path.startsWith("/") || path.startsWith("/admin")) return new NextResponse(null, { status: 204 });

  let referrer: string | null = null;
  try {
    if (body.referrer) {
      const host = new URL(body.referrer).hostname.replace(/^www\./, "");
      const self = new URL(req.url).hostname.replace(/^www\./, "");
      if (host && host !== self) referrer = host.slice(0, 200);
    }
  } catch { /* ignore */ }

  const cookies = Object.fromEntries((req.headers.get("cookie") ?? "").split(/;\s*/).filter(Boolean).map((c) => { const i = c.indexOf("="); return [c.slice(0, i), c.slice(i + 1)]; }));
  const visitorId = /^[a-f0-9-]{36}$/.test(cookies.pp_vid ?? "") ? cookies.pp_vid : randomUUID();
  const sessionId = /^[a-f0-9-]{36}$/.test(cookies.pp_sid ?? "") ? cookies.pp_sid : randomUUID();
  const country = (req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? req.headers.get("x-country") ?? "").slice(0, 8) || null;

  await db.insert(schema.pageViews).values({
    path, referrer, utmSource: typeof body.utm === "string" ? body.utm.slice(0, 100) : null,
    device: device(ua, Number(body.w) || undefined), browser: browser(ua), country, visitorId, sessionId,
  });

  const res = new NextResponse(null, { status: 204 });
  const secure = (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol).includes("https");
  res.cookies.set("pp_vid", visitorId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 365 });
  res.cookies.set("pp_sid", sessionId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 30 });
  return res;
}
