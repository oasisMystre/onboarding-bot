import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { updateWebinarById } from "../../controllers/webinar.controller";
import { deleteMessagesByUser } from "../../controllers/message.controller";

export default function rescheduleAction(bot: Telegraf) {
  bot.action("reshedule", (context) => {
    return Promise.allSettled([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        state: "pre",
        nextWebinarSequence: moment().add(8, "hours").toDate(),
        metadata: {
          reschedule: true,
          preWebinarLoopIndex: 1,
          postWebinarLoopIndex: 2,
        },
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-4.md", "utf-8").replace(
          "%name%",
          context.user.name
        ),
        Markup.inlineKeyboard([
          Markup.button.callback("💼 Weekdays", "schedule-weekdays"),
          Markup.button.callback("🎉 Weekend", "schedule-weekend"),
        ])
      ),
    ]);
  });
}
