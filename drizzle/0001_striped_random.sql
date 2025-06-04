ALTER TABLE "messages" ALTER COLUMN "user" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "buttons" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "media" json;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "auto" boolean DEFAULT true NOT NULL;