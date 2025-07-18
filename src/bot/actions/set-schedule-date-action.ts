import moment from "moment";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText } from "../../utils/format";
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

      const diffHours = date.clone().diff(now, "hours");
      const diffMinutes = date.clone().diff(now, "minutes");

      const scheduleMessages = [];

      if (diffHours >= 24) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(24, "hours").toDate(),
            text: readFileSync("locale/en/webinar/flow-9.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
          })
        );
      }

      if (diffHours >= 12) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(12, "hours").toDate(),
            text: readFileSync("locale/en/webinar/flow-10.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
          })
        );
      }

      if (diffHours >= 6) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(6, "hours").toDate(),
            text: readFileSync("locale/en/webinar/flow-11.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }

      if (diffHours >= 2) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(2, "hours").toDate(),
            text: readFileSync("locale/en/webinar/flow-12.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }

      if (diffMinutes >= 15) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(15, "minutes").toDate(),
            text: readFileSync("locale/en/webinar/flow-13.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }

      if (diffMinutes >= 5) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [
              {
                type: "url",
                name: "🚀 Join Now",
                data: getEnv("LIVE_LINK"),
              },
            ],
            user: context.user.id,
            schedule: date.clone().subtract(5, "minutes").toDate(),
            text: readFileSync("locale/en/webinar/flow-14.md", "utf-8")
              .replace("%name%", context.user.name)
              .replace("%link%", getEnv("LIVE_LINK")),
          })
        );
      }

      return Promise.allSettled([
        updateWebinarById(db, context.user.webinar.id, {
          state: null,
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
          buttons: [
            {
              type: "url",
              name: "📈 Create Trading Account",
              data: getEnv("TRADE_ACCOUNT_LINK"),
            },
          ],
          user: context.user.id,
          schedule: moment().add(2, "minutes").toDate(),
          text: readFileSync("locale/en/webinar/flow-8.md", "utf-8")
            .replace("%code%", cleanText(getEnv("CODE")))
            .replace("%admin%", cleanText(getEnv("ADMIN")))
            .replace("%link%", getEnv("TRADE_ACCOUNT_LINK")),
        }),
        createMessages(db, {
          buttons: [
            {
              type: "url",
              name: "🔴 Join Us Live Now",
              data: getEnv("LIVE_LINK"),
            },
          ],
          user: context.user.id,
          schedule: date.toDate(),
          text: readFileSync("locale/en/webinar/flow-15.md", "utf-8")
            .replace("%name%", context.user.name)
            .replace("%link%", getEnv("LIVE_LINK")),
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
                data: "reschedule",
              },
            ],
          ],
          user: context.user.id,
          schedule: date.clone().add(1, "hours").toDate(),
          text: readFileSync("locale/en/webinar/flow-16.md", "utf-8").replace(
            "%name%",
            context.user.name
          ),
        }),
      ]);
    }
  });
}
