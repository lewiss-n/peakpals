CREATE TYPE "public"."activity" AS ENUM('HIKE', 'BOOTCAMP', 'RUN_CHALLENGE');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('EASY', 'MODERATE', 'DIFFICULT');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('NEW', 'CONTACTED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('IMAGE', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."location_zone" AS ENUM('NEAR_NAIROBI', 'OUT_OF_NAIROBI', 'VIRTUAL');--> statement-breakpoint
CREATE TABLE "albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(160) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"location" varchar(160),
	"story" text,
	"guide_note" varchar(200),
	"event_id" uuid,
	"cover_media_id" uuid,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "albums_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(16) NOT NULL,
	"event_id" uuid NOT NULL,
	"lead_name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"participants" jsonb NOT NULL,
	"participant_count" integer NOT NULL,
	"has_minors" boolean DEFAULT false NOT NULL,
	"guardian_name" varchar(120),
	"guardian_phone" varchar(40),
	"guardian_consent" boolean DEFAULT false NOT NULL,
	"photo_consent" boolean DEFAULT false NOT NULL,
	"data_consent" boolean NOT NULL,
	"terms_accepted" boolean NOT NULL,
	"notes" text,
	"total_kes" integer NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation" varchar(160) NOT NULL,
	"contact_name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40),
	"group_size" integer,
	"preferred_date" varchar(60),
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"status" "enquiry_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(160) NOT NULL,
	"activity" "activity" DEFAULT 'HIKE' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'MODERATE' NOT NULL,
	"zone" "location_zone" DEFAULT 'NEAR_NAIROBI' NOT NULL,
	"region" varchar(160) NOT NULL,
	"meeting_point" varchar(200) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_hours" real,
	"distance_km" real,
	"elevation_gain_m" integer,
	"highest_point_m" integer,
	"price_kes" integer NOT NULL,
	"capacity" integer NOT NULL,
	"guide_ratio" varchar(60),
	"instructor" varchar(120),
	"summary" varchar(280) NOT NULL,
	"description" text NOT NULL,
	"inclusions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bring" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_media_id" uuid,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid,
	"kind" "media_kind" DEFAULT 'IMAGE' NOT NULL,
	"file" text NOT NULL,
	"thumb" text,
	"mime" varchar(80) NOT NULL,
	"width" integer,
	"height" integer,
	"blur" text,
	"caption" text,
	"alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(300) NOT NULL,
	"referrer" varchar(200),
	"utm_source" varchar(100),
	"device" varchar(20) NOT NULL,
	"browser" varchar(40),
	"country" varchar(8),
	"visitor_id" varchar(64) NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_event_idx" ON "bookings" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "bookings_created_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_starts_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "media_album_idx" ON "media" USING btree ("album_id");--> statement-breakpoint
CREATE INDEX "pv_created_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pv_path_idx" ON "page_views" USING btree ("path");--> statement-breakpoint
CREATE INDEX "pv_visitor_idx" ON "page_views" USING btree ("visitor_id");