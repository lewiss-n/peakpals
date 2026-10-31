import path from "node:path";
import fs from "node:fs/promises";

/** Files go to Vercel Blob when a Blob token is configured, otherwise to the local UPLOAD_DIR. */
export const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export function uploadDir() {
  return path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads");
}

/** Saves a file and returns what to store in the database: a full URL (Blob) or a relative path (disk). */
export async function putFile(relPath: string, data: Buffer, contentType: string): Promise<string> {
  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const r = await put(`uploads/${relPath}`, data, { access: "public", contentType, addRandomSuffix: false, cacheControlMaxAge: 60 * 60 * 24 * 365 });
    return r.url;
  }
  const full = path.join(uploadDir(), relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
  return relPath;
}

export async function removeFile(stored: string | null | undefined) {
  if (!stored) return;
  if (/^https?:\/\//.test(stored)) {
    if (!useBlob()) return;
    const { del } = await import("@vercel/blob");
    await del(stored).catch((e) => console.warn("[storage] could not delete", stored, e));
    return;
  }
  await fs.rm(path.join(uploadDir(), stored), { force: true });
}
