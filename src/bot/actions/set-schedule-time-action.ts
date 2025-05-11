import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { cleanText, format } from "../../utils/format";

export default function setScheduleTimeAction(bot: Telegraf) {
  bot.action(/^set_schedule_time-(.+)$/, (context) => {
    const text =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (text) {
      const [, ...dates] = text.split(/-/g);
      console.log(dates);
      const date = moment(dates.join("-"));

      const times = [
        "🕘 9AM",
        "🕚 11AM",
        "🕐 13PM",
        "🕒 15PM",
        "🕔 17PM",
        "🕖 19PM",
      ];

      return context.replyWithMarkdownV2(
        readFileSync("locale/en/webinar/flow-6.md", "utf-8")
          .replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          )
          .replace("%date%", cleanText(moment().format("MMM Do YYYY"))),
        Markup.inlineKeyboard([
          ...times.map((value, index) => {
            const [emoji, time] = value.split(/\s+/g);
            date.add(index, "days").set({
              second: 0,
              minute: 0,
              hour: parseInt(time.replace(/AM|PM/i, "")),
            });

            return [
              Markup.button.callback(
                date.format(format("% %", emoji, "h A")),
                format("set_schedule_date-%", date.toISOString())
              ),
            ];
          }),
        ])
      );
    }
  });
}
