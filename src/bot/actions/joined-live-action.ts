import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";

export const joinedLiveAction = (bot: Telegraf) => {
  bot.action("joined-live", async (context) => {
    return Promise.allSettled([
      updateWebinarById(db, context.user.webinar.id, {
        state: "post",
        nextWebinarSequence: moment().add(24, "hours").toDate(),
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-14.md", "utf-8")
          .replace("%name%", cleanText(context.user.name))
          .replace("%link%", cleanText(getEnv("GIFT_LINK")))
          .replace("%project_name%", cleanText(getEnv("PROJECT_NAME"))),
        Markup.inlineKeyboard([
          Markup.button.url(
            "📥 Download Your Strategy Blueprint",
            getEnv("GIFT_LINK")
          ),
        ])
      ),
    ]);
  });
};
