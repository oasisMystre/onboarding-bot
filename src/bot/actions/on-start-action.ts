import moment from "moment";
import { readFileSync } from "fs";
import { Markup, TelegramError, type Telegraf } from "telegraf";

import { db } from "../../instances";
import { getEnv } from "../../env";
import { privateFunc } from "../utils/private-func";
import { cleanText, format } from "../../utils/format";
import { updateUserById } from "../../controllers/users.controller";
import { updateWebinarById } from "../../controllers/webinar.controller";
import {
  createMessages,
  deleteMessagesByUser,
} from "../../controllers/message.controller";

export default function onStartAction(bot: Telegraf) {
  const onStart = privateFunc(async (context) => {
    if (context.from)
      return Promise.allSettled([
        context.telegram
          .approveChatJoinRequest(getEnv("CHANNEL_ID", Number), context.from.id)
          .catch(async (error) => {
            if (error instanceof TelegramError) {
              if (error.description.includes("USER_ALREADY_PARTICIPANT"))
                return Promise.allSettled([
                  deleteMessagesByUser(db, context.user.id),
                  updateUserById(db, context.user.id, { joinedChannel: true }),
                  updateWebinarById(db, context.user!.webinar.id, {
                    state: "pre",
                    nextWebinarSequence: moment().add(8, "hours").toDate(),
                    metadata: {
                      postWebinarLoopIndex: 2,
                      preWebinarLoopIndex: 1,
                    },
                  }),
                  createMessages(db, {
                    text: readFileSync(
                      "locale/en/webinar/flow-1.md",
                      "utf-8"
                    ).replace(
                      "%name%",
                      format(
                        "[%](tg://user/?id=%)",
                        context.user.name,
                        context.user.id
                      )
                    ),
                    buttons: [
                      {
                        type: "callback",
                        name: "✅ Yes, Send Link",
                        data: "send-link",
                      },
                      {
                        type: "callback",
                        name: "⏳ Reschedule Me",
                        data: "reshedule",
                      },
                    ],
                    user: context.user.id,
                    schedule: moment().add(2, "minutes").toDate(),
                  }),
                  context.replyWithMarkdownV2(
                    readFileSync("locale/en/start-message.md", "utf-8")
                      .replace(
                        "%name%",
                        format(
                          "[%](tg://user/?id=%)",
                          context.user.name,
                          context.user.id
                        )
                      )
                      .replace(
                        "%link%",
                        cleanText(getEnv("TRADE_ACCOUNT_LINK"))
                      )
                      .replace(
                        "%product_name%",
                        cleanText(getEnv("PRODUCT_NAME"))
                      ),
                    Markup.inlineKeyboard([
                      Markup.button.url(
                        "✅ Create Trading Account",
                        getEnv("TRADE_ACCOUNT_LINK")
                      ),
                    ])
                  ),
                ]);
              return context.reply(getEnv("CHANNEL_INVITE_LINK"));
            }
          }),
      ]);
  });

  bot.start(onStart);
  bot.action("onstart", onStart);
}
