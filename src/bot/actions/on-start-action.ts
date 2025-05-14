import moment from "moment";
import { readFileSync } from "fs";
import { TelegramError, type Telegraf } from "telegraf";

import { db } from "../../instances";
import { getEnv } from "../../env";
import { privateFunc } from "../utils/private-func";
import { cleanText, format } from "../../utils/format";
import { createMessages } from "../../controllers/message.controller";
import { updateWebinarById } from "controllers/webinar.controller";

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
                  updateWebinarById(db, context.user!.webinar.id, {
                    metadata: {},
                  }),
                  createMessages(db, {
                    text: readFileSync(
                      "locale/en/webinar/flow-1.md",
                      "utf-8"
                    ).replace(
                      "%name%",
                      format(
                        "%%",
                        context.from!.first_name,
                        context.from!.last_name
                      )
                    ),
                    buttons: [
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
                    ],
                    user: context.user.id,
                    schedule: moment().add(2, "minutes").toDate(),
                  }),
                  context.replyWithMarkdownV2(
                    readFileSync("locale/en/start-message.md", "utf-8")
                      .replace(
                        "%name%",
                        cleanText(
                          format(
                            "%%",
                            context.from!.first_name,
                            context.from!.last_name
                          )
                        )
                      )
                      .replace(
                        "%product_name%",
                        cleanText(format("%%", getEnv("PRODUCT_NAME")))
                      )
                  ),
                ]);
              return context.reply(getEnv("CHANNEL_INVITE_LINK"));
            }
          }),
      ]);
  });

  bot.start(onStart);
  bot.action("on-start", onStart);
}
