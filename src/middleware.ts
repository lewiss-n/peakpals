import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get("pp_session")?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try { await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET)); ok = true; } catch { ok = false; }
  }
  if (ok) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  // Build the redirect from the host the visitor actually used (works behind proxies).
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto = (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  const search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(new URL(`/admin/login${search}`, `${proto}://${host}`));
}
