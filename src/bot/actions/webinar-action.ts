import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";
import { deleteMessagesByUser } from "../../controllers/message.controller";

export const webinarAction = (bot: Telegraf) => {
  bot.action("webinar", (context) => {
    return Promise.allSettled([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { postWebinarLoopIndex: 1, preWebinarLoopIndex: 1 },
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-1.md", "utf-8").replace(
          "%name%",
          cleanText(
            format("%%", context.from!.first_name, context.from!.last_name)
          )
        ),
        Markup.inlineKeyboard([
          [
            {
              type: "callback",
              name: "Yes, Send Link",
              data: "send-link",
            },
            {
              type: "callback",
              name: "Reschedule Me",
              data: "reshedule",
            },
          ].map((button) => Markup.button.callback(button.name, button.data)),
        ])
      ),
    ]);
  });
};
