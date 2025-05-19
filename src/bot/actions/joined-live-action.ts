import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";

export const joinedLiveAction = (bot: Telegraf) => {
  bot.action("joined-live", async (context) => {
    return Promise.allSettled([
      updateWebinarById(db, context.user.webinar.id, { state: "post" }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-3.md", "utf-8")
          .replace("%code%", cleanText(getEnv("CODE")))
          .replace("%admin%", cleanText(getEnv("ADMIN")))
          .replace("%link%", getEnv("TRADE_ACCOUNT_LINK"))
      ),
    ]);
  });
};
