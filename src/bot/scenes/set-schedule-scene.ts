import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Scenes } from "telegraf";

import { db } from "../../instances";
import { format } from "../../utils/format";
import { updateMessageById } from "../../controllers/message.controller";
import { buildBroadcastMessage } from "./broadcast-scene/build-message";

export const setScheduleSceneId = "set-schedule-scene-id";
export const setScheduleScene = new Scenes.WizardScene(
  setScheduleSceneId,
  async (context) => {
    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (data) {
      const [, id] = data.split(/_/g);

      context.session.broadcast.id = id;
      context.session.broadcast.messageId = context.msgId!;

      await context.replyWithMarkdownV2(
        readFileSync("locale/en/tools/broadcast/schedule.md", "utf-8"),
        {
          link_preview_options: {
            is_disabled: true,
          },
          reply_markup: Markup.forceReply().reply_markup,
        }
      );

      return context.wizard.next();
    }
  },
  async (context) => {
    const text =
      context.message && "text" in context.message
        ? context.message.text
        : undefined;

    if (text) {
      try {
        const schedule = moment(
          text,
          [
            "D/M/YYYY h:mm A",
            "D/M/YYYY h:mm",
            "D/M/YYYY",
            "DD/MM/YYYY h:mm A",
            "DD/MM/YYYY h:mm",
            "DD/MM/YYYY",
          ],
          false
        );
        const [message] = await updateMessageById(
          db,
          context.session.broadcast.id,
          { schedule: schedule.toDate() }
        );

        if (message)
          return Promise.allSettled([
            context.scene.leave(),
            context.session.broadcast.messageId
              ? context
                  .deleteMessages([context.session.broadcast.messageId])
                  .then(() => (context.session.broadcast.messageId = undefined))
              : undefined,
            buildBroadcastMessage(context, message),
          ]);
      } catch {
        return context.replyWithMarkdownV2(
          format(
            "*Invalid Date\\.*\n %",
            readFileSync("locale/en/tools/broadcast/schedule.md", "utf-8")
          ),
          {
            link_preview_options: {
              is_disabled: true,
            },
            reply_markup: Markup.forceReply().reply_markup,
          }
        );
      }
    }
  }
);
