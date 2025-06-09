import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Scenes } from "telegraf";

import { db } from "../../instances";
import { updateMessageById } from "../../controllers/message.controller";
import { getBroadcastControls } from "./broadcast-scene/broadcast-action";
import { buildBroadcastMessage } from "./broadcast-scene/build-message";

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

    let message;

    if (text) {
      if (/empty/.test(text)) {
        [message] = await updateMessageById(db, context.session.broadcast.id, {
          buttons: [],
        });
      } else {
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

        [message] = await updateMessageById(db, context.session.broadcast.id, {
          buttons,
        });
      }

      return Promise.allSettled([
        context.scene.leave(),
        context.session.broadcast.messageId
          ? context
              .deleteMessages([context.session.broadcast.messageId])
              .then(() => (context.session.broadcast.messageId = undefined))
          : undefined,
        buildBroadcastMessage(context, message),
      ]);
    }
  }
);
