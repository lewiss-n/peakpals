CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'FULFILLED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "merch_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(16) NOT NULL,
	"product_id" uuid,
	"product_name" varchar(160) NOT NULL,
	"size" varchar(20),
	"color" varchar(40),
	"quantity" integer NOT NULL,
	"unit_price_kes" integer NOT NULL,
	"total_kes" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"delivery" varchar(20) NOT NULL,
	"address" text,
	"notes" text,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "merch_orders_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" varchar(40) DEFAULT 'Apparel' NOT NULL,
	"art" varchar(20) DEFAULT 'tee' NOT NULL,
	"summary" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_kes" integer NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "merch_orders" ADD CONSTRAINT "merch_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "merch_orders_created_idx" ON "merch_orders" USING btree ("created_at");