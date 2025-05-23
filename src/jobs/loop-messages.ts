import { readFileSync } from "fs";
import { eq, or } from "drizzle-orm";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../env";
import { Database } from "../db";
import { format } from "../utils/format";
import { webinar } from "../db/schema";
import { updateWebinarById } from "../controllers/webinar.controller";

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const webinars = await db.query.webinar.findMany({
    where: or(
      eq(webinar.disablePreWebinarSequence, false),
      eq(webinar.disablePostWebinarSequence, false)
    ),
    with: {
      user: {
        columns: { id: true, name: true },
      },
    },
    columns: {
      id: true,
      state: true,
      metadata: true,
    },
  });

  console.log("[processing.loop.messages] webinars=", webinars.length);

  return Promise.allSettled(
    webinars.flatMap(async (webinar) => {
      const loopIndex =
        webinar.state === "pre"
          ? webinar.metadata.preWebinarLoopIndex >= 20
            ? 1
            : webinar.metadata.preWebinarLoopIndex
          : webinar.metadata.postWebinarLoopIndex >= 20
          ? 1
          : webinar.metadata.postWebinarLoopIndex;

      if (webinar.state === "pre")
        webinar.metadata.preWebinarLoopIndex = loopIndex + 1;
      else webinar.metadata.postWebinarLoopIndex = loopIndex + 1;

      return [
        bot.telegram.sendMessage(
          webinar.user.id,
          readFileSync(
            format(
              "locale/en/loop/%/flow-%.md",
              webinar.state === "pre" ? "prewebinar" : "postwebinar",
              loopIndex
            ),
            "utf-8"
          )
            .replace("%name%", webinar.user.name!)
            .replace("%product_name%", getEnv("PRODUCT_NAME")),
          {
            parse_mode: "MarkdownV2",
            reply_markup: Markup.inlineKeyboard([
              [
                webinar.state === "pre"
                  ? Markup.button.callback("🚀 I'm Ready", "webinar")
                  : Markup.button.url(
                      "＋ Create Account",
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
        updateWebinarById(db, webinar.id, { metadata: webinar.metadata }),
      ];
    })
  );
};
