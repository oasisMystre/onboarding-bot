import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";
import {
  createMessages,
  deleteMessagesByUser,
} from "../../controllers/message.controller";

export default function sendLinkAction(bot: Telegraf) {
  bot.action("send-link", (context) => {
    if (context.user.webinar.metadata.date) return context.deleteMessage();

    return Promise.all([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { postWebinarLoopIndex: 1, preWebinarLoopIndex: 1 },
      }),
      createMessages(db, {
        buttons: [
          [
            {
              type: "callback",
              name: "✅ I Attended",
              data: "joined-live",
            },
          ],
          [
            {
              type: "callback",
              name: "🔁 I Missed It",
              data: "reshedule",
            },
          ],
        ],
        user: context.user.id,
        schedule: moment().add(30, "minutes").toDate(),
        text: readFileSync("locale/en/webinar/flow-13.md", "utf-8").replace(
          "%name%",
          cleanText(
            format("%%", context.from.first_name, context.from.last_name)
          )
        ),
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-2.md", "utf-8")
          .replace("%name%", cleanText(context.user.name))
          .replace("%link%", cleanText(getEnv("LIVE_LINK")))
          .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME"))),
        Markup.inlineKeyboard([
          Markup.button.url("🔴 Join Us Live Now", getEnv("LIVE_LINK")),
        ])
      ),
    ]);
  });
}
