import { readFileSync } from "fs";
import { Markup, type Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { getEnv } from "../../env";
import { cleanText, format } from "../../utils/format";

export default function onJoinAction(bot: Telegraf) {
  bot.on(message("new_chat_members"), async (context) =>
    Promise.all([
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
          .replace(
            "%product_name%",
            cleanText(
              format(
                "%%",
                context.botInfo.first_name,
                context.botInfo.last_name
              )
            )
          ),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback("⚡️ Start", "start"),
          ]).reply_markup,
        }
      ),
    ])
  );
}
