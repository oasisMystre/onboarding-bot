import moment from 'moment';
import type { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { users, webinar as _webinar } from '../db/schema';
import { userInsertSchema } from '../db/zod';

export const createUser = async (
  db: Database,
  value: z.infer<typeof userInsertSchema>
) => {
  const [user] = await db
    .insert(users)
    .values(value)
    .onConflictDoUpdate({ target: [users.id], set: value })
    .returning()
    .execute();

  const [webinar] = await db
    .insert(_webinar)
    .values({
      user: user.id,
      nextWebinarSequence: moment().add(8, 'hours').toDate(),
      metadata: { postWebinarLoopIndex: 1, preWebinarLoopIndex: 1 },
    })
    .onConflictDoUpdate({ target: _webinar.user, set: { user: user.id } })
    .returning()
    .execute();

  return { ...user, webinar };
};

export const updateUserById = async (
  db: Database,
  id: z.infer<typeof userInsertSchema>['id'],
  values: Partial<z.infer<typeof userInsertSchema>>
) => db.update(users).set(values).where(eq(users.id, id)).returning().execute();
