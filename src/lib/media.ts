import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { putFile, removeFile } from "./storage";

export { uploadDir, useBlob } from "./storage";
export { mediaUrl } from "./media-url";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

function folder() {
  const d = new Date();
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

type Opts = { albumId?: string | null; caption?: string | null; alt?: string | null; sortOrder?: number };

/** Resizes an image to a 2000px and a 720px WebP plus a tiny blur placeholder, stores them, and records the media row. */
export async function saveImage(input: Buffer, opts: Opts = {}) {
  const id = randomUUID();
  const dir = folder();
  const base = sharp(input, { failOn: "error" }).rotate();
  const meta = await base.clone().metadata();
  const lg = await base.clone().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const sm = await base.clone().resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
  const tiny = await base.clone().resize(20, 20, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  const file = await putFile(`${dir}/${id}.webp`, lg.data, "image/webp");
  const thumb = await putFile(`${dir}/${id}-sm.webp`, sm, "image/webp");
  const [row] = await db.insert(schema.media).values({
    id, albumId: opts.albumId ?? null, kind: "IMAGE", file, thumb, mime: "image/webp",
    width: lg.info.width ?? meta.width, height: lg.info.height ?? meta.height,
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
    caption: opts.caption ?? null, alt: opts.alt ?? null, sortOrder: opts.sortOrder ?? 0,
  }).returning();
  return row;
}

export async function saveVideo(input: Buffer, mime: string, opts: Opts = {}) {
  const ext = VIDEO_TYPES[mime];
  if (!ext) throw new Error("Unsupported video type");
  const id = randomUUID();
  const file = await putFile(`${folder()}/${id}.${ext}`, input, mime);
  return recordVideo(file, mime, opts, id);
}

/** Records a video that is already stored (e.g. uploaded straight to Vercel Blob from the browser). */
export async function recordVideo(file: string, mime: string, opts: Opts = {}, id: string = randomUUID()) {
  const [row] = await db.insert(schema.media).values({
    id, albumId: opts.albumId ?? null, kind: "VIDEO", file, mime, caption: opts.caption ?? null, sortOrder: opts.sortOrder ?? 0,
  }).returning();
  return row;
}

export async function deleteMedia(id: string) {
  const [row] = await db.delete(schema.media).where(eq(schema.media.id, id)).returning();
  if (!row) return;
  await removeFile(row.file);
  await removeFile(row.thumb);
}
