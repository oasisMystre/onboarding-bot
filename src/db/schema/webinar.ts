import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

type Metadata = {
  schedule?: "weekend" | "weekdays" | null;
  date?: string | null;
  time?: string | null;
  reschedule?: boolean | null;
};

export const webinar = pgTable("webinar", {
  id: uuid().defaultRandom().primaryKey(),
  user: text()
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  metadata: jsonb().$type<Metadata>().notNull(),
});
