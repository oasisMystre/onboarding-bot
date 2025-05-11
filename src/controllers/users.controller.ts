import type { Database } from "../db";
import { users } from "../db/schema";
import { userInsertSchema } from "../db/zod";

export const createUser = async (
  db: Database,
  value: Zod.infer<typeof userInsertSchema>
) => {
  const [user] = await db
    .insert(users)
    .values(value)
    .onConflictDoUpdate({ target: [users.id], set: value })
    .returning()
    .execute();

  return user;
};

export const updateUser = async (
  db: Database,
  values: Partial<Zod.infer<typeof userInsertSchema>>
) => db.update(users).set(values).returning().execute();
