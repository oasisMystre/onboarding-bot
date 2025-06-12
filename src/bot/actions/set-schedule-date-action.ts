import moment from "moment";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { cleanText } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";
import {
  createMessages,
  deleteMessagesByUser,
} from "../../controllers/message.controller";

export default function setScheduleDateAction(bot: Telegraf) {
  bot.action(/^setScheduleDate_(.+)$/, async (context) => {
    if (context.user.webinar.metadata.time)
      await deleteMessagesByUser(db, context.user.id);

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
            text: readFileSync("locale/en/webinar/flow-8.md", "utf-8")
              .replace("%name%", cleanText(context.user.name))
              .replace("%time%", cleanText(date.format("h:mm A")))
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
            text: readFileSync("locale/en/webinar/flow-9.md", "utf-8")
              .replace("%name%", cleanText(context.user.name))
              .replace("%date%", cleanText(date.format("MMM Do YYYY, h:mm A"))),
          })
        );
      }

      if (diffHours >= 2) {
        scheduleMessages.push(
          createMessages(db, {
            buttons: [],
            user: context.user.id,
            schedule: date.clone().subtract(2, "hours").toDate(),
            text: readFileSync("locale/en/webinar/flow-10.md", "utf-8")
              .replace("%name%", cleanText(context.user.name))
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
            text: readFileSync("locale/en/webinar/flow-11.md", "utf-8")
              .replace("%name%", cleanText(context.user.name))
              .replace("%time%", cleanText(date.format("h:mm A"))),
          })
        );
      }

      return Promise.allSettled([
        updateWebinarById(db, context.user.webinar.id, {
          state: null,
          nextWebinarSequence: moment().add(2, "hours").toDate(),
          metadata: {
            ...context.user.webinar.metadata,
            time: date.toISOString(),
          },
        }),
        ...scheduleMessages,
        context.replyWithMarkdownV2(
          readFileSync("locale/en/webinar/flow-6.md", "utf-8")
            .replace("%name%", cleanText(context.user.name))
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
          text: readFileSync("locale/en/webinar/flow-7.md", "utf-8")
            .replace("%name%", cleanText(context.user.name))
            .replace("%code%", cleanText(getEnv("CODE")))
            .replace("%admin%", cleanText(getEnv("ADMIN")))
            .replace("%link%", cleanText(getEnv("TRADE_ACCOUNT_LINK"))),
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
          text: readFileSync("locale/en/webinar/flow-12.md", "utf-8")
            .replace("%name%", cleanText(context.user.name))
            .replace("%link%", cleanText(getEnv("LIVE_LINK"))),
        }),
        createMessages(db, {
          buttons: [
            [
              {
                type: "callback",
                name: "✅ I Attended",
                data: "joined-live",
              },
            ],
            [
              {
                type: "callback",
                name: "🔁 I Missed It",
                data: "reshedule",
              },
            ],
          ],
          user: context.user.id,
          schedule: date.clone().add(30, "minutes").toDate(),
          text: readFileSync("locale/en/webinar/flow-13.md", "utf-8").replace(
            "%name%",
            cleanText(context.user.name)
          ),
        }),
      ]);
    }
  });
}
