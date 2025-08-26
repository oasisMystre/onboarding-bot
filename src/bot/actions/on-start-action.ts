import moment from "moment";
import { readFileSync } from "fs";
import { Markup, TelegramError, type Telegraf } from "telegraf";

import { db } from "../../instances";
import { getEnv } from "../../env";
import { privateFunc } from "../utils/private-func";
import { cleanText } from "../../utils/format";
import { updateUserById } from "../../controllers/users.controller";
import { updateWebinarById } from "../../controllers/webinar.controller";
import {
  createMessages,
  deleteMessagesByUser,
} from "../../controllers/message.controller";

export default function onStartAction(bot: Telegraf) {
  const onStart = privateFunc(async (context) => {
    if (context.from)
      return Promise.all([
        context.telegram
          .approveChatJoinRequest(getEnv("CHANNEL_ID", Number), context.from.id)
          .catch(async (error) => {
            if (error instanceof TelegramError) {
              if (error.description.includes("USER_ALREADY_PARTICIPANT"))
                return Promise.all([
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
                    ).replace("%name%", context.user.name),
                    buttons: [
                      {
                        type: "callback",
                        name: "✅ Yes, Send Link",
                        data: "send-link",
                      },
                      {
                        type: "callback",
                        name: "⏳ Reschedule Me",
                        data: "reschedulee",
                      },
                    ],
                    user: context.user.id,
                    schedule: moment().add(30, "seconds").toDate(),
                  }),
                  context.replyWithMarkdownV2(
                    readFileSync("locale/en/start-message.md", "utf-8")
                      .replace("%name%", context.user.name)
                      .replace("%channel%", getEnv("CHANNEL_INVITE_LINK"))
                      .replace("%admin%", getEnv("ADMIN"))
                      .replace("%link%", getEnv("TRADE_ACCOUNT_LINK"))
                      .replace(
                        /%productname%/g,
                        cleanText(getEnv("PRODUCT_NAME"))
                      ),
                    {
                      link_preview_options: { is_disabled: true },
                      reply_markup: Markup.inlineKeyboard([
                        Markup.button.url(
                          "✅ Create Trading Account",
                          getEnv("TRADE_ACCOUNT_LINK")
                        ),
                      ]).reply_markup,
                    }
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
