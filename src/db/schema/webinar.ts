import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

type Metadata = {
  schedule?: "weekend" | "weekdays" | null;
  date?: string | null;
  time?: string | null;
  reschedule?: boolean | null;
  preWebinarLoopIndex: number;
  postWebinarLoopIndex: number;
};

export const webinar = pgTable("webinar", {
  id: uuid().defaultRandom().primaryKey(),
  user: text()
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  state: text({ enum: ["pre", "post"] })
    .default("pre"),
  disablePostWebinarSequence: boolean().default(false),
  disablePreWebinarSequence: boolean().default(false),
  metadata: jsonb().$type<Metadata>().notNull(),
  nextWebinarSequence: timestamp().notNull(),
});
