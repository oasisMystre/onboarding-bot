import { eq } from "drizzle-orm";

import { Database } from "../db";
import { webinar } from "../db/schema";
import {
  userSelectSchema,
  webinarInsertSchema,
  webinarSelectSchema,
} from "../db/zod";

export const createWebinar = (
  db: Database,
  value: Zod.infer<typeof webinarInsertSchema>
) => db.insert(webinar).values(value).returning().execute();

export const getWebinarByUser = (
  db: Database,
  user: Zod.infer<typeof userSelectSchema>["id"]
) => db.query.webinar.findFirst({ where: eq(webinar.id, user) });

export const updateWebinarById = (
  db: Database,
  id: Zod.infer<typeof webinarSelectSchema>["id"],
  value: Partial<Zod.infer<typeof webinarInsertSchema>>
) =>
  db.update(webinar).set(value).where(eq(webinar.id, id)).returning().execute();
