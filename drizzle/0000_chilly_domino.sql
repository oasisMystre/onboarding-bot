CREATE TABLE "webinar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" text NOT NULL,
	"state" text DEFAULT 'pre',
	"disablePostWebinarSequence" boolean DEFAULT false,
	"disablePreWebinarSequence" boolean DEFAULT false,
	"metadata" jsonb NOT NULL,
	"nextWebinarSequence" timestamp NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webinar_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"joinedChannel" boolean DEFAULT false NOT NULL,
	"lastLogin" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"media" jsonb,
	"schedule" timestamp NOT NULL,
	"auto" boolean DEFAULT true NOT NULL,
	"buttons" jsonb[] NOT NULL,
	"user" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"stats" jsonb
);
--> statement-breakpoint
ALTER TABLE "webinar" ADD CONSTRAINT "webinar_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;