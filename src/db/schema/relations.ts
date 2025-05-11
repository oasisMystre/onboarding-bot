import { relations } from "drizzle-orm";
import { users } from "./users";
import { messages } from "./messages";

export const userRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.user], references: [users.id] }),
}));
