import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { updateWebinarById } from "controllers/webinar.controller";

export default function rescheduleAction(bot: Telegraf) {
  bot.action("reshedule", (context) => {
    if (context.user.webinar.metadata.reschedule) return;

    return Promise.all([
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { ...context.user.webinar.metadata, reschedule: true },
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-4.md", "utf-8").replace(
          "%name%",
          cleanText(
            format("%%", context.from.first_name, context.from.last_name)
          )
        ),
        Markup.inlineKeyboard([
          Markup.button.callback("Weekdays", "schedule-weekdays"),
          Markup.button.callback("Weekend", "schedule-weekend"),
        ])
      ),
    ]);
  });
}
