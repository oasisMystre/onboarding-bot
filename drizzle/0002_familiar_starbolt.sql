ALTER TABLE "messages" ALTER COLUMN "media" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "buttons" SET DATA TYPE jsonb[];--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "stats" jsonb;