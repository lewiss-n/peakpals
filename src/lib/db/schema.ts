import {
  pgTable, pgEnum, uuid, text, varchar, integer, boolean, timestamp, jsonb, real, index, type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const activityEnum = pgEnum("activity", ["HIKE", "BOOTCAMP", "RUN_CHALLENGE"]);
export const difficultyEnum = pgEnum("difficulty", ["EASY", "MODERATE", "DIFFICULT"]);
export const zoneEnum = pgEnum("location_zone", ["NEAR_NAIROBI", "OUT_OF_NAIROBI", "VIRTUAL"]);
export const bookingStatusEnum = pgEnum("booking_status", ["PENDING", "CONFIRMED", "CANCELLED"]);
export const mediaKindEnum = pgEnum("media_kind", ["IMAGE", "VIDEO"]);
export const enquiryStatusEnum = pgEnum("enquiry_status", ["NEW", "CONTACTED", "CLOSED"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id").references((): AnyPgColumn => albums.id, { onDelete: "cascade" }),
  kind: mediaKindEnum("kind").notNull().default("IMAGE"),
  /** file names relative to UPLOAD_DIR */
  file: text("file").notNull(),
  thumb: text("thumb"),
  mime: varchar("mime", { length: 80 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  blur: text("blur"),
  caption: text("caption"),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("media_album_idx").on(t.albumId)]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  activity: activityEnum("activity").notNull().default("HIKE"),
  difficulty: difficultyEnum("difficulty").notNull().default("MODERATE"),
  zone: zoneEnum("zone").notNull().default("NEAR_NAIROBI"),
  region: varchar("region", { length: 160 }).notNull(),
  meetingPoint: varchar("meeting_point", { length: 200 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationHours: real("duration_hours"),
  distanceKm: real("distance_km"),
  elevationGainM: integer("elevation_gain_m"),
  highestPointM: integer("highest_point_m"),
  priceKes: integer("price_kes").notNull(),
  capacity: integer("capacity").notNull(),
  guideRatio: varchar("guide_ratio", { length: 60 }),
  instructor: varchar("instructor", { length: 120 }),
  summary: varchar("summary", { length: 280 }).notNull(),
  description: text("description").notNull(),
  inclusions: jsonb("inclusions").$type<string[]>().notNull().default([]),
  bring: jsonb("bring").$type<string[]>().notNull().default([]),
  coverMediaId: uuid("cover_media_id").references((): AnyPgColumn => media.id, { onDelete: "set null" }),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("events_starts_idx").on(t.startsAt)]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 16 }).notNull().unique(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  leadName: varchar("lead_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  participants: jsonb("participants").$type<{ name: string; age: number }[]>().notNull(),
  participantCount: integer("participant_count").notNull(),
  hasMinors: boolean("has_minors").notNull().default(false),
  guardianName: varchar("guardian_name", { length: 120 }),
  guardianPhone: varchar("guardian_phone", { length: 40 }),
  guardianConsent: boolean("guardian_consent").notNull().default(false),
  photoConsent: boolean("photo_consent").notNull().default(false),
  dataConsent: boolean("data_consent").notNull(),
  termsAccepted: boolean("terms_accepted").notNull(),
  notes: text("notes"),
  totalKes: integer("total_kes").notNull(),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("bookings_event_idx").on(t.eventId), index("bookings_created_idx").on(t.createdAt)]);

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 160 }),
  story: text("story"),
  guideNote: varchar("guide_note", { length: 200 }),
  eventId: uuid("event_id").references((): AnyPgColumn => events.id, { onDelete: "set null" }),
  coverMediaId: uuid("cover_media_id"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisation: varchar("organisation", { length: 160 }).notNull(),
  contactName: varchar("contact_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  groupSize: integer("group_size"),
  preferredDate: varchar("preferred_date", { length: 60 }),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  message: text("message"),
  status: enquiryStatusEnum("status").notNull().default("NEW"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: varchar("path", { length: 300 }).notNull(),
  referrer: varchar("referrer", { length: 200 }),
  utmSource: varchar("utm_source", { length: 100 }),
  device: varchar("device", { length: 20 }).notNull(),
  browser: varchar("browser", { length: 40 }),
  country: varchar("country", { length: 8 }),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("pv_created_idx").on(t.createdAt),
  index("pv_path_idx").on(t.path),
  index("pv_visitor_idx").on(t.visitorId),
]);

export type Event = typeof events.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Media = typeof media.$inferSelect;

export const orderStatusEnum = pgEnum("order_status", ["PENDING", "PAID", "FULFILLED", "CANCELLED"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 40 }).notNull().default("Apparel"),
  /** illustration used when there are no photos yet: tee | hoodie | cap | bottle | buff | tote */
  art: varchar("art", { length: 20 }).notNull().default("tee"),
  summary: varchar("summary", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  priceKes: integer("price_kes").notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  /** media ids, first one is the main photo */
  images: jsonb("images").$type<string[]>().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const merchOrders = pgTable("merch_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 16 }).notNull().unique(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 160 }).notNull(),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 40 }),
  quantity: integer("quantity").notNull(),
  unitPriceKes: integer("unit_price_kes").notNull(),
  totalKes: integer("total_kes").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  delivery: varchar("delivery", { length: 20 }).notNull(),
  address: text("address"),
  notes: text("notes"),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("merch_orders_created_idx").on(t.createdAt)]);

export type Product = typeof products.$inferSelect;
export type MerchOrder = typeof merchOrders.$inferSelect;
