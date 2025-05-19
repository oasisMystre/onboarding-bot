import z, { boolean, object, string, enum as enum_, number } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messages, users, webinar } from "./schema";

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

export type Button = {
  type: "callback" | "url";
  name: string;
  data: string;
};

const messageMetadataSchema = z.object({
  type: z.enum(["callback", "url"]),
  name: z.string(),
  data: z.string(),
});

export const messageSelectSchema = createSelectSchema(messages, {
  buttons: z
    .array(messageMetadataSchema)
    .or(z.array(z.array(messageMetadataSchema))),
});

export const messageInsertSchema = createInsertSchema(messages, {
  buttons: z
    .array(messageMetadataSchema)
    .or(z.array(z.array(messageMetadataSchema))),
});

const webinarMetadata = object({
  date: string().nullish(),
  time: string().nullish(),
  schedule: enum_(["weekdays", "weekend"]).nullish(),
  reschedule: boolean().nullish(),
  preWebinarLoopIndex: number(),
  postWebinarLoopIndex: number(),
});

export const webinarSelectSchema = createSelectSchema(webinar, {
  metadata: webinarMetadata,
});
export const webinarInsertSchema = createInsertSchema(webinar, {
  metadata: webinarMetadata,
});
