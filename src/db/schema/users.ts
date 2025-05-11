import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  loopIndex: integer().default(1).notNull(),
  lastLogin: timestamp().notNull(),
});
