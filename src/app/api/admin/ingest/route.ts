import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, VIDEO_TYPES, recordVideo, saveImage } from "@/lib/media";
import { mediaUrl } from "@/lib/media-url";
import { removeFile } from "@/lib/storage";
import { afterAlbumUpload, albumExists, nextSortOrder } from "@/lib/album-media";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({ url: z.string().url(), contentType: z.string(), albumId: z.string().uuid().nullable().optional() });

/** After a browser upload to Vercel Blob: resize images into web versions, or register videos as they are. */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { url, contentType } = parsed.data;
  const albumId = parsed.data.albumId ?? null;
  const u = new URL(url);
  // only accept files from this project's Blob store
  if (u.protocol !== "https:" || !u.hostname.endsWith(".public.blob.vercel-storage.com") || !u.pathname.startsWith("/incoming/")) {
    return NextResponse.json({ error: "Invalid file location" }, { status: 400 });
  }
  if (albumId && !(await albumExists(albumId))) return NextResponse.json({ error: "Album not found" }, { status: 404 });
  const order = await nextSortOrder(albumId);
  try {
    if (VIDEO_TYPES[contentType]) {
      if (!albumId) { await removeFile(url); return NextResponse.json({ error: "Videos can only be added to albums" }, { status: 400 }); }
      const row = await recordVideo(url, contentType, { albumId, sortOrder: order });
      await afterAlbumUpload(albumId);
      return NextResponse.json({ saved: [{ id: row.id, kind: row.kind, url: mediaUrl(row.file) }], failed: [] });
    }
    if (!IMAGE_TYPES.includes(contentType)) { await removeFile(url); return NextResponse.json({ error: "Unsupported file type" }, { status: 400 }); }
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: "Could not read the uploaded file" }, { status: 400 });
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) { await removeFile(url); return NextResponse.json({ error: "Image is larger than 25 MB" }, { status: 400 }); }
    const row = await saveImage(buf, { albumId, sortOrder: order });
    await removeFile(url); // the original is no longer needed once the web versions exist
    await afterAlbumUpload(albumId, row.id);
    return NextResponse.json({ saved: [{ id: row.id, kind: row.kind, url: mediaUrl(row.thumb ?? row.file) }], failed: [] });
  } catch (e) {
    console.error("[ingest]", e);
    return NextResponse.json({ error: "We couldn't process that file. Is it a valid photo?" }, { status: 400 });
  }
}
