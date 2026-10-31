export const TZ = "Africa/Nairobi";

export const kes = (n: number) => "KES " + n.toLocaleString("en-KE");

export function fmtDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-KE", { timeZone: TZ, ...opts }).format(new Date(d));
}
export const fmtTime = (d: Date | string) =>
  new Intl.DateTimeFormat("en-KE", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(d));

export const dayMonth = (d: Date | string) => ({
  day: new Intl.DateTimeFormat("en-KE", { timeZone: TZ, day: "2-digit" }).format(new Date(d)),
  mon: new Intl.DateTimeFormat("en-KE", { timeZone: TZ, month: "short" }).format(new Date(d)),
});

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "item";
}

export const ACTIVITY = {
  HIKE: { label: "Day hike", plural: "Hikes", emoji: "hike" },
  BOOTCAMP: { label: "Bootcamp", plural: "Bootcamps", emoji: "bootcamp" },
  RUN_CHALLENGE: { label: "Virtual run", plural: "Run challenges", emoji: "run" },
} as const;

export const DIFFICULTY = {
  EASY: { label: "Easy", peaks: 1, cls: "bg-olive text-white" },
  MODERATE: { label: "Moderate", peaks: 2, cls: "bg-gold text-night" },
  DIFFICULT: { label: "Difficult", peaks: 3, cls: "bg-brown text-white" },
} as const;

export const ZONE = {
  NEAR_NAIROBI: "Near Nairobi",
  OUT_OF_NAIROBI: "Out of Nairobi",
  VIRTUAL: "Virtual",
} as const;

/** Convert a datetime-local string (Nairobi time) to a Date. */
export function fromNairobiLocal(v: string) {
  return new Date(v.length === 16 ? `${v}:00+03:00` : `${v}+03:00`);
}
/** Date -> "YYYY-MM-DDTHH:mm" in Nairobi time for datetime-local inputs. */
export function toNairobiLocal(d: Date) {
  const t = new Date(d.getTime() + 3 * 3600 * 1000);
  return t.toISOString().slice(0, 16);
}
