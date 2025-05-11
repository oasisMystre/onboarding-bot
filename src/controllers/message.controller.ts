import type { Database } from "../db";
import { messages } from "../db/schema";
import type { messageInsertSchema } from "../db/zod";


export const createMessages = (
  db: Database,
  ...values: Zod.infer<typeof messageInsertSchema>[]
) => db.insert(messages).values(values).returning().execute();
