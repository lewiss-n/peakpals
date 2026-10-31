import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES, saveImage, saveVideo, useBlob } from "@/lib/media";
import { mediaUrl } from "@/lib/media-url";
import { afterAlbumUpload, albumExists, nextSortOrder } from "@/lib/album-media";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Tells the browser how to upload: straight to Vercel Blob, or as a normal form post to this route. */
export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ mode: useBlob() ? "blob" : "local" });
}

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  let fd: FormData;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: "Could not read the upload" }, { status: 400 }); }
  const albumId = String(fd.get("albumId") ?? "") || null;
  if (albumId && !(await albumExists(albumId))) return NextResponse.json({ error: "Album not found" }, { status: 404 });
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });
  let order = await nextSortOrder(albumId);
  const saved: { id: string; kind: string; url: string | null }[] = [];
  const failed: { name: string; reason: string }[] = [];
  for (const f of files) {
    try {
      const buf = Buffer.from(await f.arrayBuffer());
      if (IMAGE_TYPES.includes(f.type)) {
        if (f.size > MAX_IMAGE_BYTES) throw new Error("Image is larger than 25 MB");
        const row = await saveImage(buf, { albumId, sortOrder: order++ });
        saved.push({ id: row.id, kind: row.kind, url: mediaUrl(row.thumb ?? row.file) });
      } else if (VIDEO_TYPES[f.type]) {
        if (!albumId) throw new Error("Videos can only be added to albums");
        if (f.size > MAX_VIDEO_BYTES) throw new Error("Video is larger than 200 MB");
        const row = await saveVideo(buf, f.type, { albumId, sortOrder: order++ });
        saved.push({ id: row.id, kind: row.kind, url: mediaUrl(row.file) });
      } else {
        throw new Error("Unsupported file type. Use JPG, PNG, WebP, MP4 or MOV.");
      }
    } catch (e) {
      failed.push({ name: f.name, reason: e instanceof Error ? e.message : "Upload failed" });
    }
  }
  await afterAlbumUpload(albumId, saved.find((s) => s.kind === "IMAGE")?.id);
  return NextResponse.json({ saved, failed }, { status: saved.length ? 200 : 400 });
}
