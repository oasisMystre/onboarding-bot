import type { z } from "zod";
import moment from "moment";
import assert from "assert";
import { readFileSync } from "fs";
import { Markup, Scenes } from "telegraf";
import type { MediaGroup } from "telegraf/typings/telegram-types";

import { db } from "../../instances";
import { messageSelectSchema } from "../../db/zod";
import { format, getButtons } from "../../utils/format";
import {
  createMessages,
  updateMessageById,
} from "../../controllers/message.controller";

export const broadcastSceneId = "broadcase-scene-id";

const getBroadcastControls = (
  id: z.infer<typeof messageSelectSchema>["id"]
) => [
  [Markup.button.callback("⌛️ Set Schedule", format("set_schedule-%", id))],
  [Markup.button.callback("➕ Add Button", format("add_button-%", id))],
  [Markup.button.callback("📥 Send Message", format("send_message-%", id))],
];

export const broadcastScene = new Scenes.WizardScene(
  broadcastSceneId,
  async (context) => {
    await context.replyWithMarkdownV2(
      readFileSync("locale/en/tools/broadcast/message.md", "utf-8"),
      Markup.forceReply()
    );

    return context.wizard.next();
  },
  async (context) => {
    let text: string | undefined;
    let media: MediaGroup | undefined;

    if (context.message) {
      if ("photo" in context.message) {
        text = context.message.caption;
        media = context.message.photo.map((photo) => ({
          type: "photo",
          media: photo.file_id,
        }));
      } else if ("video" in context.message) {
        text = context.message.caption;
        media = [
          {
            type: "video",
            media: context.message.video.file_id,
          },
        ];
      } else if ("voice" in context.message) {
        text = context.message.caption;
        media = [
          {
            type: "audio",
            media: context.message.voice.file_id,
          },
        ];
      } else if ("animation" in context.message) {
        text = context.message.caption;
        media = [
          {
            type: "video",
            media: context.message.animation.file_id,
          },
        ];
      } else if ("document" in context.message) {
        text = context.message.caption;
        media = [
          {
            type: "document",
            media: context.message.document.file_id,
          },
        ];
      } else if ("text" in context.message) text = context.message.text;

      assert(text, "text is required");

      const [{ id }] = await createMessages(db, {
        text,
        media,
        auto: false,
        buttons: [],
        schedule: new Date(),
      });

      context.session.broadcast.id = id;

      await context.replyWithMarkdownV2(
        readFileSync("locale/en/tools/broadcast/detail.md", "utf-8")
          .replace("%schedule%", "Immediate")
          .replace("%message%", text),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard(getBroadcastControls(id))
            .reply_markup,
        }
      );

      return context.wizard.next();
    }
  },
  async (context) => {
    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;
    if (data) {
      context.session.broadcast.messageId = context.msgId!;

      if (/^set_schedule/.test(data)) {
        const [, ...id] = data.split(/-/g);
        context.session.broadcast.id = id.join("-");
        context.session.broadcast.actionType = "set-schedule";

        return context.replyWithMarkdownV2(
          readFileSync("locale/en/tools/broadcast/schedule.md", "utf-8"),
          {
            link_preview_options: {
              is_disabled: true,
            },
            reply_markup: Markup.forceReply().reply_markup,
          }
        );
      } else if (/^add_button/.test(data)) {
        const [, ...id] = data.split(/-/g);
        context.session.broadcast.id = id.join("-");
        context.session.broadcast.actionType = "add-button";

        return context.replyWithMarkdownV2(
          readFileSync("locale/en/tools/broadcast/button.md", "utf-8"),
          {
            link_preview_options: {
              is_disabled: true,
            },
            reply_markup: Markup.forceReply().reply_markup,
          }
        );
      }
    } else {
      const text =
        context.message && "text" in context.message
          ? context.message.text
          : undefined;
      if (text) {
        let message;
        const { actionType, id } = context.session.broadcast;

        if (actionType === "add-button") {
          const buttons = text.split("\n").map((fmtButton) => {
            const [name, link] = fmtButton.split(/-/);
            return [
              {
                name,
                data: link,
                type: "url" as const,
              },
            ];
          });

          console.log(buttons);

          [message] = await updateMessageById(db, id, { buttons });
        } else if (actionType === "set-schedule") {
          const schedule = moment(
            text,
            ["DD/MM/YYYY h:mm A", "DD/MM/YYYY", "DD/MM/YYYY h:mm"],
            true
          ).toDate();

          [message] = await updateMessageById(db, id, { schedule });
        }

        if (message)
          return Promise.all([
            message.media
              ? context.telegram.editMessageCaption
              : context.telegram.editMessageText(
                  context.user.id,
                  context.session.broadcast.messageId,
                  undefined,
                  readFileSync("locale/en/tools/broadcast/detail.md", "utf-8")
                    .replace(
                      "%schedule%",
                      moment(message.schedule).format("Do MM,YYYY h:mm A")
                    )
                    .replace("%message%", message.text),
                  {
                    link_preview_options: { is_disabled: true },
                    reply_markup: Markup.inlineKeyboard([
                      ...getButtons(message.buttons),
                      ...getBroadcastControls(id),
                    ]).reply_markup,
                  }
                ),
          ]);
      }
    }
  }
);

broadcastScene.action(/send_message/, (context) => {});
