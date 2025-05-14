import { readFileSync } from "fs";
import { message } from "telegraf/filters";
import { Context, Markup, type Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { cleanText, format } from "../../utils/format";

export default function onJoinAction(bot: Telegraf) {
  const onJoin = async (context: Context) => {
    return Promise.all([
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
            Markup.button.callback("⚡️ Start", "on-start"),
          ]).reply_markup,
        }
      ),
    ]);
  };

  bot.on("chat_member", (context) => {
    if (context.chatMember.new_chat_member) return onJoin(context);
  });

  bot.on(message("new_chat_members"), onJoin);
}
