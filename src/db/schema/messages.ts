import type { MediaGroup } from "telegraf/typings/telegram-types";
import {
  boolean,
  json,
  jsonb,
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
  media: jsonb().$type<MediaGroup>(),
  schedule: timestamp().notNull(),
  auto: boolean().default(true).notNull(),
  buttons: jsonb().array().$type<Button[] | Button[][]>().notNull(),
  user: text().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
  stats: jsonb().$type<{
    success: number;
    failed: number;
    seen: number;
    messageIds: number[];
  }>(),
});
