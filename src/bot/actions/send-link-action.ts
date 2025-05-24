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
    return Promise.allSettled([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { postWebinarLoopIndex: 2, preWebinarLoopIndex: 1 },
      }),
      createMessages(db, {
        buttons: [
          {
            type: "url",
            name: "📈 Create Trading Account",
            data: getEnv("TRADE_ACCOUNT_LINK"),
          },
        ],
        user: context.user.id,
        schedule: moment().add(2, "minutes").toDate(),
        text: readFileSync("locale/en/webinar/flow-3.md", "utf-8")
          .replace("%code%", cleanText(getEnv("CODE")))
          .replace("%admin%", cleanText(getEnv("ADMIN")))
          .replace("%link%", getEnv("TRADE_ACCOUNT_LINK")),
      }),
      createMessages(db, {
        buttons: [
          [
            {
              type: "callback",
              name: "🔴 I Joined Live",
              data: "joined-live",
            },
          ],
          [
            {
              type: "callback",
              name: "🔁 I Missed It But Want the Replay",
              data: "on-start",
            },
          ],
        ],
        user: context.user.id,
        schedule: moment().add(1, "hours").toDate(),
        text: readFileSync("locale/en/webinar/flow-16.md", "utf-8").replace(
          "%name%",
          cleanText(
            format("%%", context.from.first_name, context.from.last_name)
          )
        ),
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-2.md", "utf-8")
          .replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          )
          .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME"))),
        Markup.inlineKeyboard([
          Markup.button.url(
            "🔴 Join Us Live Now",
            getEnv("CHANNEL_INVITE_LINK")
          ),
        ])
      ),
      context.deleteMessage(),
    ]);
  });
}
