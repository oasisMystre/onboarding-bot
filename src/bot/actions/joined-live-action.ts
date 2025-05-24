import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { updateWebinarById } from "../../controllers/webinar.controller";

export const joinedLiveAction = (bot: Telegraf) => {
  bot.action("joined-live", async (context) => {
    return Promise.allSettled([
      updateWebinarById(db, context.user.webinar.id, { state: "post" }),
      context.replyWithMarkdownV2(
        readFileSync("locale/en/loop/postwebinar/flow-1.md", "utf-8")
          .replace("%name%", context.user.name)
          .replace("%product_name%", getEnv("PRODUCT_NAME")),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.url(
                "✅ Create Trading Account",
                getEnv("TRADE_ACCOUNT_LINK")
              ),
            ],
            [
              Markup.button.url(
                "💬 Contact Support",
                getEnv("CONTACT_SUPPORT")
              ),
            ],
          ]).reply_markup,
        }
      ),
    ]);
  });
};
