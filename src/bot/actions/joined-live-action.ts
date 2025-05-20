import { Telegraf } from "telegraf";

import { db } from "../../instances";
import { updateWebinarById } from "../../controllers/webinar.controller";

export const joinedLiveAction = (bot: Telegraf) => {
  bot.action("joined-live", async (context) => {
    return Promise.allSettled([
      updateWebinarById(db, context.user.webinar.id, { state: "post" }),
    ]);
  });
};
