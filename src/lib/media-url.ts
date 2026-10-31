/** Stored files are either full URLs (Vercel Blob) or paths served by the /media route (local disk). */
export const mediaUrl = (file?: string | null) => (file ? (/^https?:\/\//.test(file) ? file : `/media/${file}`) : null);
