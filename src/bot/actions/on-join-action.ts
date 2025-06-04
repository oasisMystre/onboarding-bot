import { readFileSync } from "fs";
import { message } from "telegraf/filters";
import { Context, Markup, type Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText } from "../../utils/format";
import { joinChannel } from "../utils/join-channel";
import { deleteMessagesByUser } from "../../controllers/message.controller";
import { updateWebinarById } from "../../controllers/webinar.controller";

export default function onJoinAction(bot: Telegraf) {
  const onJoin = async (context: Context) => {
    return Promise.allSettled([
      joinChannel(context),
      context.telegram.sendMessage(
        context.user.id,
        readFileSync("locale/en/joined-group.md", "utf-8").replace(
          "%project_name%",
          getEnv("PROJECT_NAME")
        ),
        { parse_mode: "MarkdownV2" }
      ),
      context.telegram.sendMessage(
        context.user.id,
        readFileSync("locale/en/welcome-message.md", "utf-8")
          .replace("%project_name%", cleanText(getEnv("PROJECT_NAME")))
          .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME"))),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback("⚡️ Start", "onstart"),
          ]).reply_markup,
        }
      ),
    ]);
  };

  bot.on("chat_member", (context) => {
    if (context.chatMember.new_chat_member) return onJoin(context);
  });

  bot.on("chat_join_request", onJoin);
  bot.on("left_chat_member", (context) => {
    Promise.allSettled([
      deleteMessagesByUser(db, context.user.id),
      updateWebinarById(db, context.user.webinar.id, {
        metadata: { postWebinarLoopIndex: 2, preWebinarLoopIndex: 1 },
      }),
    ]);
  });
  bot.on(message("new_chat_members"), onJoin);
}
