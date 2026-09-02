-- Extensions must exist before the tables below: their id defaults call
-- uuid_generate_v1() and Postgres validates default expressions at CREATE
-- TABLE time. Idempotent, safe on every database.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v1() NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" text,
	"shopid" uuid NOT NULL,
	"itemnumber" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v1() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"region" text NOT NULL,
	"username" text,
	"category" text,
	"address" text,
	"notes" text,
	"ordersbyphoneorwhatsapp" text,
	"delivery" text,
	"takeaway" text,
	"whatsappnumber" text,
	"phonenumber" text,
	"email" text,
	"submittedat" text,
	"opentimes" text,
	"deliverycost" text,
	"visibility" text,
	"logo" text,
	"background" text,
	"typeformtoken" text,
	"ordersphonenumber" text,
	"orderswhatsappnumber" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shops_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shopid_fkey" FOREIGN KEY ("shopid") REFERENCES "public"."shops"("id") ON DELETE no action ON UPDATE no action;