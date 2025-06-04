import type { MediaGroup } from "telegraf/typings/telegram-types";
import {
  boolean,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export type Button = {
  type: "callback" | "url";
  name: string;
  data: string;
};

export const messages = pgTable("messages", {
  id: uuid().defaultRandom().primaryKey(),
  text: text().notNull(),
  media: json().$type<MediaGroup>(),
  schedule: timestamp().notNull(),
  auto: boolean().default(true).notNull(),
  buttons: json().array().$type<Button[] | Button[][]>().notNull(),
  user: text().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
});
