ALTER TABLE "webinar" DROP CONSTRAINT "webinar_user_users_id_fk";
--> statement-breakpoint
ALTER TABLE "webinar" ADD CONSTRAINT "webinar_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;