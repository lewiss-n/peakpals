import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAlbums, getUpcomingEvents } from "@/lib/queries";
import { getProducts } from "@/lib/merch";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = ["", "/events", "/activities", "/memories", "/shop", "/about", "/team-building", "/privacy", "/terms"].map((p) => ({ url: `${site.url}${p}` }));
  try {
    const [events, albums, products] = await Promise.all([getUpcomingEvents({}, 200), getAlbums(200), getProducts()]);
    return [...base, ...events.map((e) => ({ url: `${site.url}/events/${e.event.slug}`, lastModified: e.event.updatedAt })), ...albums.map((a) => ({ url: `${site.url}/memories/${a.album.slug}` })), ...products.map((p) => ({ url: `${site.url}/shop/${p.slug}`, lastModified: p.updatedAt }))];
  } catch {
    return base;
  }
}
