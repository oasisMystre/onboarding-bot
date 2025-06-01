import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";
import { deleteMessagesByUser } from "../../controllers/message.controller";

export default function rescheduleAction(bot: Telegraf) {
  bot.action("reshedule", (context) => {
    if (context.user.webinar.metadata.date) return context.deleteMessage();

    return Promise.allSettled([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        state: "pre",
        nextWebinarSequence: moment().add(24, "hours").toDate(),
        metadata: { ...context.user.webinar.metadata, reschedule: true },
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-4.md", "utf-8").replace(
          "%name%",
          cleanText(context.user.name)
        ),
        Markup.inlineKeyboard([
          Markup.button.callback("💼 Weekdays", "schedule-weekdays"),
          Markup.button.callback("🎉 Weekend", "schedule-weekend"),
        ])
      ),
    ]);
  });
}
