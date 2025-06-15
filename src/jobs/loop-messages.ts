import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";
import { and, eq, isNotNull, lte, or, sql } from "drizzle-orm";

import { getEnv } from "../env";
import { Database } from "../db";
import { webinar } from "../db/schema";
import { cleanText, format } from "../utils/format";
import { updateWebinarById } from "../controllers/webinar.controller";

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const webinars = await db.query.webinar.findMany({
    where: and(
      or(
        eq(webinar.disablePreWebinarSequence, false),
        eq(webinar.disablePostWebinarSequence, false)
      ),
      lte(webinar.nextWebinarSequence, sql`NOW()`),
      isNotNull(webinar.state)
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
      if (webinar.state) {
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
              .replace("%name%", cleanText(webinar.user.name!))
              .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME"))),
            {
              parse_mode: "MarkdownV2",
              reply_markup: Markup.inlineKeyboard([
                [
                  webinar.state === "pre"
                    ? Markup.button.callback("🚀 I'm Ready", "webinar")
                    : Markup.button.url(
                        "✅  Trading Account",
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
          updateWebinarById(db, webinar.id, {
            metadata: webinar.metadata,
            nextWebinarSequence: moment().add(8, "hours").toDate(),
          }),
        ];
      }
    })
  );
};
