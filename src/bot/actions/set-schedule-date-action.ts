import moment from "moment";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { createMessages } from "../../controllers/message.controller";

export default function setScheduleDateAction(bot: Telegraf) {
  bot.action(/^set_schedule_date-(.+)$/, (context) => {
    const text =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (text) {
      const [, ...dates] = text.split(/-/g);
      const date = moment(dates.join("-"));

      return Promise.all([
        context.replyWithMarkdownV2(
          readFileSync("locale/en/webinar/flow-7.md", "utf-8")
            .replace("%date%", date.format("MMM Do YYYY"))
            .replace("%time%", date.format("h A"))
        ),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment().add(2, "minutes").toDate(),
          text: readFileSync("locale/en/webinar/flow-8.md", "utf-8")
            .replace("%code%", cleanText(getEnv("CODE")))
            .replace("%admin%", cleanText(getEnv("ADMIN"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).subtract(24, "h").toDate(),
          text: readFileSync("locale/en/webinar/flow-9.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).subtract(12, "hours").toDate(),
          text: readFileSync("locale/en/webinar/flow-10.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).subtract(6, "hours").toDate(),
          text: readFileSync("locale/en/webinar/flow-11.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%time%", cleanText(date.format("h:mm A"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).subtract(2, "hours").toDate(),
          text: readFileSync("locale/en/webinar/flow-12.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%time%", cleanText(date.format("h:mm A"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).add(30, "minutes").toDate(),
          text: readFileSync("locale/en/webinar/flow-13.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%time%", cleanText(date.format("h:mm A"))),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: moment(date).add(15, "minutes").toDate(),
          text: readFileSync("locale/en/webinar/flow-14.md", "utf-8").replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          ),
        }),
        createMessages(db, {
          buttons: [],
          user: context.user.id,
          schedule: date.toDate(),
          text: readFileSync("locale/en/webinar/flow-15.md", "utf-8").replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          ),
        }),
        createMessages(db, {
          buttons: [
            {
              type: "callback",
              name: "🔴 I Joined Live",
              data: "joined-live",
            },
            {
              type: "callback",
              name: "🔁 I Missed It But Want the Replay",
              data: "reschedule",
            },
          ],
          user: context.user.id,
          schedule: moment(date).add(1, "hours").toDate(),
          text: readFileSync("locale/en/webinar/flow-16.md", "utf-8").replace(
            "%name%",
            cleanText(
              format("%%", context.from.first_name, context.from.last_name)
            )
          ),
        }),
      ]);
    }
  });
}
