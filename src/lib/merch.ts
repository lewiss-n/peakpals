import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import type { Product } from "./db/schema";

export const CATEGORIES = ["Apparel", "Headwear", "Gear", "Accessories"] as const;
export const ART = ["tee", "hoodie", "cap", "bottle", "buff", "tote"] as const;
export type Art = (typeof ART)[number];

export type ProductImage = { id: string; file: string; thumb: string | null; blur: string | null; width: number | null; height: number | null };
export type ProductWithImages = Product & { photos: ProductImage[] };

async function attach(rows: Product[]): Promise<ProductWithImages[]> {
  const ids = [...new Set(rows.flatMap((r) => r.images))];
  const media = ids.length
    ? await db.select({ id: schema.media.id, file: schema.media.file, thumb: schema.media.thumb, blur: schema.media.blur, width: schema.media.width, height: schema.media.height })
        .from(schema.media).where(inArray(schema.media.id, ids))
    : [];
  const byId = new Map(media.map((m) => [m.id, m]));
  return rows.map((r) => ({ ...r, photos: r.images.map((id) => byId.get(id)).filter(Boolean) as ProductImage[] }));
}

export async function getProducts(category?: string) {
  const conds = [eq(schema.products.published, true)];
  if (category && (CATEGORIES as readonly string[]).includes(category)) conds.push(eq(schema.products.category, category));
  const rows = await db.select().from(schema.products).where(and(...conds))
    .orderBy(desc(schema.products.featured), asc(schema.products.sortOrder), desc(schema.products.createdAt));
  return attach(rows);
}

export async function getFeaturedProducts(limit = 4) {
  const rows = await db.select().from(schema.products).where(eq(schema.products.published, true))
    .orderBy(desc(schema.products.featured), desc(schema.products.inStock), asc(schema.products.sortOrder), desc(schema.products.createdAt)).limit(limit);
  return attach(rows);
}

export async function getProductBySlug(slug: string) {
  const [row] = await db.select().from(schema.products).where(and(eq(schema.products.slug, slug), eq(schema.products.published, true))).limit(1);
  return row ? (await attach([row]))[0] : null;
}

export async function getProductById(id: string) {
  const [row] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  return row ? (await attach([row]))[0] : null;
}
