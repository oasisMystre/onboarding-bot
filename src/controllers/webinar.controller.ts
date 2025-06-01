import moment from "moment";
import type { z } from "zod";
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
  value: Omit<z.infer<typeof webinarInsertSchema>, "nextWebinarSequence">
) =>
  db
    .insert(webinar)
    .values({
      ...value,
      nextWebinarSequence: moment().add(24, "hours").toDate(),
    })
    .returning()
    .execute();

export const getWebinarByUser = (
  db: Database,
  user: z.infer<typeof userSelectSchema>["id"]
) => db.query.webinar.findFirst({ where: eq(webinar.id, user) });

export const updateWebinarById = (
  db: Database,
  id: z.infer<typeof webinarSelectSchema>["id"],
  value: Partial<z.infer<typeof webinarInsertSchema>>
) =>
  db.update(webinar).set(value).where(eq(webinar.id, id)).returning().execute();
