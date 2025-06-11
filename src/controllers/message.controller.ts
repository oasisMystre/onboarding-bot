import type { z } from "zod";

import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { messages } from "../db/schema";
import type {
  messageInsertSchema,
  messageSelectSchema,
  userSelectSchema,
} from "../db/zod";

export const createMessages = (
  db: Database,
  ...values: z.infer<typeof messageInsertSchema>[]
) => db.insert(messages).values(values).returning().execute();

export const getMessageById = (
  db: Database,
  id: z.infer<typeof messageSelectSchema>["id"]
) =>
  db.query.messages
    .findFirst({
      where: eq(messages.id, id),
    })
    .execute();

export const updateMessageById = (
  db: Database,
  id: z.infer<typeof messageSelectSchema>["id"],
  value: Partial<z.infer<typeof messageInsertSchema>>
) =>
  db
    .update(messages)
    .set(value)
    .where(eq(messages.id, id))
    .returning()
    .execute();

export const deleteMessagesByUser = (
  db: Database,
  user: z.infer<typeof userSelectSchema>["id"]
) => db.delete(messages).where(eq(messages.user, user)).execute();
