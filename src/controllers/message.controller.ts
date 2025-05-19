import type { z } from "zod";

import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { messages } from "../db/schema";
import type { messageInsertSchema, userSelectSchema } from "../db/zod";

export const createMessages = (
  db: Database,
  ...values: z.infer<typeof messageInsertSchema>[]
) => db.insert(messages).values(values).returning().execute();

export const deleteMessagesByUser = (
  db: Database,
  user: z.infer<typeof userSelectSchema>["id"]
) => db.delete(messages).where(eq(messages.user, user)).execute();
