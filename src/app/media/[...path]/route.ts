import path from "node:path";
import fs from "node:fs";
import { Readable } from "node:stream";
import { uploadDir } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
};

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path;
  if (parts.some((p) => p === ".." || p.includes("\\") || p.startsWith("."))) return new Response("Not found", { status: 404 });
  const root = uploadDir();
  const file = path.resolve(root, ...parts);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  let stat: fs.Stats;
  try { stat = await fs.promises.stat(file); } catch { return new Response("Not found", { status: 404 }); }
  if (!stat.isFile()) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : stat.size - parseInt(m[2], 10);
      const end = m[1] && m[2] ? Math.min(parseInt(m[2], 10), stat.size - 1) : stat.size - 1;
      if (start >= 0 && start <= end && start < stat.size) {
        const stream = fs.createReadStream(file, { start, end });
        return new Response(Readable.toWeb(stream) as ReadableStream, {
          status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) },
        });
      }
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    }
  }
  const stream = fs.createReadStream(file);
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers: { ...headers, "Content-Length": String(stat.size) } });
}
