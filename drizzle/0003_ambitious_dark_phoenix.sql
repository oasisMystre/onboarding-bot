ALTER TABLE "webinar" ADD COLUMN "state" text DEFAULT 'pre' NOT NULL;--> statement-breakpoint
ALTER TABLE "webinar" ADD COLUMN "disablePostWebinarSequence" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "webinar" ADD COLUMN "disablePreWebinarSequence" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "loopIndex";