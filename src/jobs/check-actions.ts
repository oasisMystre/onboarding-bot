import moment from "moment";
import { and, isNull, lte, sql } from "drizzle-orm";

import { Database } from "../db";
import { webinar } from "../db/schema";
import { updateWebinarById } from "../controllers/webinar.controller";

export const checkActions = async (db: Database) => {
  const webinars = await db.query.webinar.findMany({
    where: and(
      isNull(webinar.state),
      lte(sql`${webinar.nextWebinarSequence} + INTERVAL '8 hours'`, sql`NOW() `)
    ),
    columns: {
      id: true,
    },
  });

  console.log("[processing.inactive.webinar] webinars=", webinars.length);

  return Promise.allSettled(
    webinars.flatMap(async (webinar) =>
      updateWebinarById(db, webinar.id, {
        state: "pre",
        disablePreWebinarSequence: false,
        nextWebinarSequence: moment().toDate(),
      })
    )
  );
};
