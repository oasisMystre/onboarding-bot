import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { getWeekdays, getWeekends } from "../../utils/date";
import { updateWebinarById } from "../../controllers/webinar.controller";

export default function scheduleAction(bot: Telegraf) {
  bot.action(/schedule-(weekdays|weekend)/, (context) => {
    if (context.user.webinar.metadata.date) return;

    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;
    if (data) {
      const [, type] = data.split(/-/g);
      const dates = type === "weekdays" ? getWeekdays() : getWeekends();

      return Promise.allSettled([
        updateWebinarById(db, context.user.webinar.id, {
          metadata: {
            ...context.user.webinar.metadata,
            schedule: type as "weekdays" | "weekend",
          },
        }),
        context.replyWithMarkdownV2(
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
                  format("setScheduleTime_%", date.toISOString())
                ),
              ];
            }),
          ])
        ),
      ]);
    }
  });
}
