import { eq, lte, sql } from "drizzle-orm";
import { Markup, Telegraf } from "telegraf";

import type { Database } from "../db";
import { getButtons } from "../utils/format";
import { messages } from "../db/schema";

export const processScheduledMessages = async (db: Database, bot: Telegraf) => {
  const scheduledMessages = await db.query.messages
    .findMany({
      where: lte(messages.schedule, sql`NOW()`),
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
        if (message.media)
          await bot.telegram.sendMediaGroup(message.user.id, message.media);
        else
          await bot.telegram.sendMessage(message.user.id, message.text, {
            parse_mode: "MarkdownV2",
            reply_markup,
          });
      }

      await db.delete(messages).where(eq(messages.id, message.id)).execute();
    })
  );
};
