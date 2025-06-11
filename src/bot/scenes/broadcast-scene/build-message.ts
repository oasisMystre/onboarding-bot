import moment from "moment";
import type { z } from "zod";
import { readFileSync } from "fs";
import { Context, Markup } from "telegraf";

import { messageSelectSchema } from "../../../db/zod";
import { getBroadcastControls } from "./broadcast-action";
import { cleanText, getButtons } from "../../../utils/format";

export const buildBroadcastMessage = (
  context: Context,
  message: Pick<
    z.infer<typeof messageSelectSchema>,
    "text" | "media" | "buttons" | "schedule" | "id" | "metadata"
  >
) => {
  const buttons = [
    ...getButtons(message.buttons),
    ...getBroadcastControls(message.id),
  ];
  const reply_markup = Markup.inlineKeyboard(buttons).reply_markup;
  const text = readFileSync("locale/en/tools/broadcast/detail.md", "utf-8")
    .replace("%message%", cleanText(message.text))
    .replace(
      "%schedule%",
      moment(message.schedule).format("Do MM,YYYY h:mm A")
    );

  if (message.media) {
    const [media] = message.media;
    if (!media.caption && message.text.replace(/\s/g, ""))
      media.caption = message.text;
    if (!media.parse_mode) media.parse_mode = "MarkdownV2";

    const func = (() => {
      switch (media.type) {
        case "audio":
          return context.sendAudio;
        case "document":
          return context.sendDocument;
        case "video":
          return context.sendVideo;
        case "photo":
          return context.sendPhoto;
      }
    })();

    return func.bind(context)(media.media, {
      reply_markup,
      caption: text,
      parse_mode: media.parse_mode,
      caption_entities: media.caption_entities,
    });
  } else
    return context.replyWithMarkdownV2(text, {
      reply_markup,
      parse_mode: "MarkdownV2",
      entities: message.metadata?.entities,
    });
};
