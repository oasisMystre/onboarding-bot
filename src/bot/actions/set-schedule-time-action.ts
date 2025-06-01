import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";
import { deleteMessagesByUser } from "controllers/message.controller";

export default function setScheduleTimeAction(bot: Telegraf) {
  bot.action(/^setScheduleTime_(.+)$/, async (context) => {
    if (context.user.webinar.metadata.time)
      await deleteMessagesByUser(db, context.user.id);

    const text =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (text) {
      const [, ISOString] = text.split(/_/);
      const date = moment(ISOString);

      const times = [
        "🕘 9AM",
        "🕚 11AM",
        "🕐 13PM",
        "🕒 15PM",
        "🕔 17PM",
        "🕖 19PM",
      ];

      return Promise.allSettled([
        updateWebinarById(db, context.user.webinar.id, {
          state: "pre",
          nextWebinarSequence: moment().add(8, "hours").toDate(),
          metadata: {
            ...context.user.webinar.metadata,
            date: date.toISOString(),
          },
        }),
        context.replyWithMarkdownV2(
          readFileSync("locale/en/webinar/flow-5.md", "utf-8")
            .replace("%name%", cleanText(context.user.name))
            .replace("%date%", cleanText(date.format("MMM Do YYYY"))),
          Markup.inlineKeyboard([
            ...times
              .filter((value) => {
                const [, time] = value.split(/\s+/g);
                const now = moment();
                const dateClone = date.clone().set({
                  second: 0,
                  minute: 0,
                  hour: parseInt(time.replace(/AM|PM/i, "")),
                });

                return dateClone.diff(now) > 0;
              })
              .map((value) => {
                const [emoji, time] = value.split(/\s+/g);
                date.set({
                  second: 0,
                  minute: 0,
                  hour: parseInt(time.replace(/AM|PM/i, "")),
                });

                return [
                  Markup.button.callback(
                    date.format(format("% %", emoji, "h A")),
                    format("setScheduleDate_%", date.toISOString())
                  ),
                ];
              }),
          ])
        ),
      ]);
    }
  });
}
