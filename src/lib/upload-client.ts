"use client";

export type Uploaded = { id: string; kind: "IMAGE" | "VIDEO"; url: string };

let modePromise: Promise<"blob" | "local"> | null = null;
function getMode() {
  modePromise ??= fetch("/api/admin/upload", { cache: "no-store" })
    .then((r) => r.json())
    .then((j) => (j.mode === "blob" ? "blob" : "local"))
    .catch(() => "local" as const);
  return modePromise;
}

function postForm(file: File, albumId: string | null, onProgress?: (pct: number) => void) {
  return new Promise<Uploaded>((resolve, reject) => {
    const fd = new FormData();
    if (albumId) fd.append("albumId", albumId);
    fd.append("files", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && j.saved?.[0]) resolve(j.saved[0]);
        else reject(new Error(j.failed?.[0]?.reason ?? j.error ?? "Upload failed"));
      } catch { reject(new Error(xhr.status === 413 ? "File is too large" : "Upload failed")); }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(fd);
  });
}

async function viaBlob(file: File, albumId: string | null, onProgress?: (pct: number) => void): Promise<Uploaded> {
  const { upload } = await import("@vercel/blob/client");
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "upload";
  const blob = await upload(`incoming/${safe}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob",
    contentType: file.type,
    multipart: file.size > 8 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });
  const r = await fetch("/api/admin/ingest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: blob.url, contentType: file.type, albumId }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.saved?.[0]) throw new Error(j.error ?? "Processing failed");
  return j.saved[0];
}

/** Uploads one photo or video. Large files go straight to Vercel Blob when it's configured. */
export async function uploadMedia(file: File, opts: { albumId?: string | null; onProgress?: (pct: number) => void } = {}) {
  const albumId = opts.albumId ?? null;
  return (await getMode()) === "blob" ? viaBlob(file, albumId, opts.onProgress) : postForm(file, albumId, opts.onProgress);
}
