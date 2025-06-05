import assert from "assert";
import { uniqBy } from "lodash";
import { readFileSync } from "fs";
import { Markup, Scenes } from "telegraf";
import type { MediaGroup } from "telegraf/typings/telegram-types";

import { db } from "../../../instances";
import { statsAction } from "./stats-action";
import { cleanText } from "../../../utils/format";
import { addButtonSceneId } from "../add-button-scene";
import { sendMessageAction } from "./send-message-action";
import { getBroadcastControls } from "./broadcast-action";
import { setScheduleSceneId } from "../set-schedule-scene";
import { createMessages } from "../../../controllers/message.controller";

export const broadcastSceneId = "broadcase-scene-id";
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
        media = uniqBy(context.message.photo, "file_id").map((photo) => ({
          type: "photo",
          media: photo.file_id,
        }));

        media[0].caption = text;
        media[0].parse_mode = "MarkdownV2";
        media[0].caption_entities = context.message.caption_entities;
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
        text: cleanText(text),
        media,
        auto: false,
        buttons: [],
        schedule: new Date(),
        metadata: {
          entities:
            "entities" in context.message
              ? context.message.entities
              : undefined,
        },
      });

      context.session.broadcast.id = id;

      await context.replyWithMarkdownV2(
        readFileSync("locale/en/tools/broadcast/detail.md", "utf-8")
          .replace("%schedule%", "Immediate")
          .replace("%message%", cleanText(text)),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard(getBroadcastControls(id))
            .reply_markup,
        }
      );

      return context.wizard.next();
    }
  }
);

broadcastScene.action(
  /^(sendMessage|addButton|setSchedule|stats)/,
  (context) => {
    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;
    console.log(data);
    if (data) {
      if (/sendMessage/.test(data)) return sendMessageAction(context);
      else if (/addButton/.test(data))
        return context.scene.enter(addButtonSceneId);
      else if (/setSchedule/.test(data))
        return context.scene.enter(setScheduleSceneId);
      else if (/stats/.test(data)) return statsAction(context);
    }
  }
);
