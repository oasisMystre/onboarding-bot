import z from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messages, users } from "./schema";

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
