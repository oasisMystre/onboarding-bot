import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Scenes } from "telegraf";

import { db } from "../../instances";
import { getButtons } from "../../utils/format";
import { updateMessageById } from "../../controllers/message.controller";
import { getBroadcastControls } from "./broadcast-scene/broadcast-action";

export const addButtonSceneId = "add-button-scene-id";
export const addButtonScene = new Scenes.WizardScene(
  addButtonSceneId,
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
        readFileSync("locale/en/tools/broadcast/button.md", "utf-8"),
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
      if (/empty/.test(text))
        return Promise.allSettled([
          context.scene.leave(),
          updateMessageById(db, context.session.broadcast.id, { buttons: [] }),
          Promise.allSettled([
            context.scene.leave(),
            context.telegram.editMessageReplyMarkup(
              context.user.id,
              context.session.broadcast.messageId,
              undefined,
              Markup.inlineKeyboard([
                ...getBroadcastControls(context.session.broadcast.id),
              ]).reply_markup
            ),
          ]),
        ]);

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

      return Promise.allSettled([
        await updateMessageById(db, context.session.broadcast.id, { buttons }),
        context.scene.leave(),
        context.telegram.editMessageReplyMarkup(
          context.user.id,
          context.session.broadcast.messageId,
          undefined,
          Markup.inlineKeyboard([
            ...getButtons(buttons),
            ...getBroadcastControls(context.session.broadcast.id),
          ]).reply_markup
        ),
      ]);
    }
  }
);
