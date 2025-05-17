import moment from "moment";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { createMessages } from "../../controllers/message.controller";
import { updateWebinarById } from "../../controllers/webinar.controller";

export default function setScheduleDateAction(bot: Telegraf) {
  bot.action(/^setScheduleDate_(.+)$/, (context) => {
    if (context.user.webinar.metadata.date) return;

    const text =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (text) {
      const [, ISOString] = text.split(/_/g);
      const now = moment();
      const date = moment(ISOString);

      const twentyHrsBefore = moment(date).subtract(24, "hours");
      const twelveHrsBefore = moment(date).subtract(12, "hours");
      const sixHrsBefore = moment(date).subtract(6, "hours");
      const twoHoursBefore = moment(date).subtract(2, "hours");
      const thirtyMinutesBefore = moment(date).subtract(30, "minutes");
      const fifteenMinutesBefore = moment(date).subtract(15, "minutes");

      const scheduleMessages = [];

      if (twentyHrsBefore.isSameOrAfter(now.add(24, "hours"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: twelveHrsBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-9.md", "utf-8")
              .replace(
                "%name%",
                cleanText(
                  format("%%", context.from.first_name, context.from.last_name)
                )
              )
              .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
          })
        );
      }
      if (twelveHrsBefore.isSameOrAfter(now.add(12, "hours"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: twelveHrsBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-10.md", "utf-8")
              .replace(
                "%name%",
                cleanText(
                  format("%%", context.from.first_name, context.from.last_name)
                )
              )
              .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
          })
        );
      }
      if (sixHrsBefore.isSameOrAfter(now.add(6, "hours"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: sixHrsBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-11.md", "utf-8")
              .replace(
                "%name%",
                cleanText(
                  format("%%", context.from.first_name, context.from.last_name)
                )
              )
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }
      if (twoHoursBefore.isSameOrAfter(now.add(2, "hours"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: twoHoursBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-12.md", "utf-8")
              .replace(
                "%name%",
                cleanText(
                  format("%%", context.from.first_name, context.from.last_name)
                )
              )
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }
      if (thirtyMinutesBefore.isSameOrAfter(now.add(30, "minutes"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: thirtyMinutesBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-13.md", "utf-8")
              .replace(
                "%name%",
                cleanText(
                  format("%%", context.from.first_name, context.from.last_name)
                )
              )
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }
      if (fifteenMinutesBefore.isSameOrAfter(now.add(30, "minutes"))) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: fifteenMinutesBefore.toDate(),
            text: readFileSync("locale/en/webinar/flow-14.md", "utf-8").replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            ),
          })
        );
      }

      return Promise.all([
        updateWebinarById(db, context.user.webinar.id, {
          metadata: {
            ...context.user.webinar.metadata,
            date: date.toISOString(),
          },
        }),
        ...scheduleMessages,
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
            .replace("%admin%", cleanText(getEnv("ADMIN")))
            .replace("%link%", getEnv("TRADE_ACCOUNT_LINK")),
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
            [
              {
                type: "callback",
                name: "🔴 I Joined Live",
                data: "joined-live",
              },
            ],
            [
              {
                type: "callback",
                name: "🔁 I Missed It But Want the Replay",
                data: "start",
              },
            ],
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
