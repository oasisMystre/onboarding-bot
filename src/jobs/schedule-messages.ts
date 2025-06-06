import { and, eq, lte, sql } from "drizzle-orm";
import { Markup, Telegraf } from "telegraf";

import type { Database } from "../db";
import { getButtons } from "../utils/format";
import { messages } from "../db/schema";
import { updateMessageById } from "../controllers/message.controller";

export const processScheduledMessages = async (db: Database, bot: Telegraf) => {
  const scheduledMessages = await db.query.messages
    .findMany({
      where: and(lte(messages.schedule, sql`NOW()`), eq(messages.auto, true)),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    })
    .execute();

  console.log("[processing.messages] messages=", scheduledMessages.length);

  return Promise.all(
    scheduledMessages.map(async (message) => {
      const reply_markup = message.buttons
        ? Markup.inlineKeyboard(getButtons(message.buttons)).reply_markup
        : undefined;

      if (message.user) {
        if (message.media) {
          if (!message.media[0].caption) {
            message.media[0].caption = message.text;
            message.media[0].parse_mode = "MarkdownV2";
          }
          await bot.telegram.sendMediaGroup(message.user.id, message.media);
        } else
          await bot.telegram.sendMessage(message.user.id, message.text, {
            parse_mode: "MarkdownV2",
            reply_markup,
            entities: message.metadata?.entities,
          });

        await db.delete(messages).where(eq(messages.id, message.id)).execute();
      } else {
        const users = await db.query.users.findMany();

        const settlements = await Promise.allSettled(
          users.map((user) => {
            if (message.media) {
              const [media] = message.media;

              if (!media.caption) media.caption = message.text;
              if (!media.parse_mode) media.parse_mode = "MarkdownV2";

              const func = (() => {
                switch (media.type) {
                  case "audio":
                    return bot.telegram.sendAudio;
                  case "document":
                    return bot.telegram.sendDocument;
                  case "video":
                    return bot.telegram.sendVideo;
                  case "photo":
                    return bot.telegram.sendPhoto;
                }
              })();

              return func(user.id, media.media, {
                reply_markup,
                caption: media.caption,
                parse_mode: media.parse_mode,
                caption_entities: media.caption_entities,
              });
            } else
              return bot.telegram.sendMessage(user.id, message.text, {
                reply_markup,
                parse_mode: "MarkdownV2",
                entities: message.metadata?.entities,
              });
          })
        );

        const success = settlements.filter(
          (settlement) => settlement.status === "fulfilled"
        );
        const failed = settlements.filter(
          (settlement) => settlement.status === "rejected"
        ).length;

        const messageIds = success.flatMap((message) => {
          if (Array.isArray(message.value))
            return message.value.map((value) => value.message_id);
          return message.value.message_id;
        });

        await updateMessageById(db, message.id, {
          auto: false,
          stats: { success: success.length, failed, seen: 0, messageIds },
        });
      }
    })
  );
};
