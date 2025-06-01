import moment from "moment";
import { readFileSync } from "fs";
import { eq, isNotNull, lte, or, sql } from "drizzle-orm";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../env";
import { Database } from "../db";
import { webinar } from "../db/schema";
import { cleanText, format } from "../utils/format";
import { updateWebinarById } from "../controllers/webinar.controller";

const postWebinarButtons = [
  [
    [Markup.button.url("Create Account", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Explore Options", getEnv("BOT_LINK"))],
    [Markup.button.url("Talk to Admin", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Fund Your Account", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Join Now", getEnv("BOT_LINK"))],
    [Markup.button.url("Message Support", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Create Account", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Explore Options", getEnv("BOT_LINK"))],
    [Markup.button.url("Talk to Admin", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Start Now", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Pick a Tier", getEnv("BOT_LINK"))],
    [Markup.button.url("Ask Questions", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Get Started", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Pick a Tier", getEnv("BOT_LINK"))],
    [Markup.button.url("Ask Questions", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Get Started", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Pick a Tier", getEnv("BOT_LINK"))],
    [Markup.button.url("Ask Questions", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Get Started", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Pick a Tier", getEnv("BOT_LINK"))],
    [Markup.button.url("Ask Questions", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Create Account", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Join Now", getEnv("BOT_LINK"))],
    [Markup.button.url("Need Help?", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Start Now", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Join Now", getEnv("BOT_LINK"))],
    [Markup.button.url("Need Help?", getEnv("CONTACT_SUPPORT"))],
  ],
  [
    [Markup.button.url("Create Account", getEnv("TRADE_ACCOUNT_LINK"))],
    [Markup.button.url("Explore Options", getEnv("BOT_LINK"))],
    [Markup.button.url("Contact Admin", getEnv("CONTACT_SUPPORT"))],
  ],
];

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const webinars = await db.query.webinar.findMany({
    where: or(
      eq(webinar.disablePreWebinarSequence, false),
      eq(webinar.disablePostWebinarSequence, false),
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
      disablePostWebinarSequence: true,
      disablePreWebinarSequence: true,
    },
  });

  console.log("[processing.loop.messages] webinars=", webinars.length);

  return Promise.allSettled(
    webinars.flatMap(async (webinar) => {
      if (webinar.state) {
        const loopIndex =
          webinar.state === "pre"
            ? webinar.metadata.preWebinarLoopIndex
            : webinar.metadata.postWebinarLoopIndex;

        if (webinar.state === "pre") {
          webinar.metadata.preWebinarLoopIndex = Math.min(loopIndex + 1, 20);
          if (webinar.metadata.preWebinarLoopIndex >= 20)
            webinar.disablePreWebinarSequence = true;
        } else {
          webinar.metadata.postWebinarLoopIndex = Math.min(loopIndex + 1, 10);
          if (webinar.metadata.postWebinarLoopIndex >= 10)
            webinar.disablePostWebinarSequence = true;
        }

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
              reply_markup: Markup.inlineKeyboard(
                webinar.state === "pre"
                  ? [
                      [Markup.button.callback("🚀 I'm Ready", "webinar")],
                      [
                        Markup.button.url(
                          "💬 Contact Support",
                          getEnv("CONTACT_SUPPORT")
                        ),
                      ],
                    ]
                  : postWebinarButtons[loopIndex]
              ).reply_markup,
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
