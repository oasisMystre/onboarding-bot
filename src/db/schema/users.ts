import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  joinedChannel: boolean().default(false).notNull(),
  lastLogin: timestamp().notNull(),
});
