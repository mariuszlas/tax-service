CREATE TABLE IF NOT EXISTS "sale_amendments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"cost" integer NOT NULL,
	"tax_rate" numeric NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sale_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sale_events_invoice_id_unique" UNIQUE("invoice_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_event_id" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"cost" integer NOT NULL,
	"tax_rate" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tax_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_event_id_sale_events_id_fk" FOREIGN KEY ("sale_event_id") REFERENCES "public"."sale_events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sale_amendments_date_idx" ON "sale_amendments" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_id_idx" ON "sale_events" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sale_events_date_idx" ON "sale_events" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sales_id_item_id_idx" ON "sale_items" USING btree ("sale_event_id","item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_payments_date_idx" ON "tax_payments" USING btree ("date");