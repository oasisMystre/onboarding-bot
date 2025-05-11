import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export type Button = {
  type: "callback" | "url";
  name: string;
  data: string;
};

export const messages = pgTable("messages", {
  id: uuid().defaultRandom().primaryKey(),
  text: text().notNull(),
  schedule: timestamp().notNull(),
  user: text()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  buttons: json().array().$type<Button[] | Button[][]>(),
  createdAt: timestamp().defaultNow().notNull(),
});
