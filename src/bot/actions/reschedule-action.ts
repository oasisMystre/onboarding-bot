import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { cleanText, format } from "../../utils/format";

export default function rescheduleAction(bot: Telegraf) {
  bot.action("reshedule", (context) =>
    context.replyWithMarkdownV2(
      readFileSync("locale/en/webinar/flow-4.md", "utf-8").replace(
        "%name%",
        cleanText(format("%%", context.from.first_name, context.from.last_name))
      ),
      Markup.inlineKeyboard([
        Markup.button.callback("Weekdays", "schedule-weekdays"),
        Markup.button.callback("Weekend", "schedule-weekend"),
      ])
    )
  );
}
