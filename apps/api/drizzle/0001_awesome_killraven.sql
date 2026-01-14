ALTER TABLE "quotes" DROP CONSTRAINT "quotes_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_groups" ADD COLUMN "manual_floor" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "quote_groups" ADD COLUMN "manual_ceiling" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "quote_groups" ADD COLUMN "manual_walls" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "quote_groups" ADD COLUMN "manual_perimeter" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;