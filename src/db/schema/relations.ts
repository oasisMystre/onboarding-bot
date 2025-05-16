import { relations } from "drizzle-orm";
import { users } from "./users";
import { messages } from "./messages";
import { webinar } from "./webinar";

export const userRelations = relations(users, ({ many, one }) => ({
  messages: many(messages),
  webinar: many(webinar),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.user], references: [users.id] }),
}));

export const webinarRelations = relations(webinar, ({ one }) => ({
  user: one(users, { fields: [webinar.user], references: [users.id] }),
}));
