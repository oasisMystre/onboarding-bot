CREATE TABLE "webinar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" text NOT NULL,
	"metadata" jsonb NOT NULL,
	CONSTRAINT "webinar_user_unique" UNIQUE("user")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "joinedChannel" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "webinar" ADD CONSTRAINT "webinar_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;