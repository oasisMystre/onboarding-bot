import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";
import { cleanText, format } from "../../utils/format";
import { getWeekdays, getWeekends } from "../../utils/date";

export default function scheduleAction(bot: Telegraf) {
  bot.action(/schedule-(weekdays|weekend)/, (context) => {
    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;
    if (data) {
      const [, type] = data.split(/-/g);
      const dates = type === "weekdays" ? getWeekdays() : getWeekends();

      return context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-5.md", "utf-8").replace(
          "%name%",
          cleanText(
            format("%%", context.from.first_name, context.from.last_name)
          )
        ),
        Markup.inlineKeyboard([
          ...dates.map((date) => {
            return [
              Markup.button.callback(
                date.format("MMM Do YYYY"),
                format("set_schedule_time-%", date.toISOString())
              ),
            ];
          }),
        ])
      );
    }
  });
}
