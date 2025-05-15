import moment from "moment";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { createMessages } from "../../controllers/message.controller";
import { updateWebinarById } from "../../controllers/webinar.controller";

export default function sendLinkAction(bot: Telegraf) {
  bot.action("send-link", (context) => {
    if (context.user.webinar.metadata.reschedule) return;

    return Promise.all([
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { ...context.user.webinar.metadata, reschedule: false },
      }),
      createMessages(db, {
        buttons: [],
        user: context.user.id,
        schedule: moment().add(2, "minutes").toDate(),
        text: readFileSync("locale/en/webinar/flow-3.md", "utf-8")
          .replace("%code%", cleanText(getEnv("CODE")))
          .replace("%admin%", cleanText(getEnv("ADMIN")))
          .replace("%link%", getEnv("TRADE_ACCOUNT_LINK")),
      }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-2.md", "utf-8")
          .replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          )
          .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME")))
      ),
      context.deleteMessage(),
    ]);
  });
}
