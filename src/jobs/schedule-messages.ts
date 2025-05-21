import { eq, lte } from "drizzle-orm";
import { Markup, Telegraf } from "telegraf";
import type { InlineKeyboardButton } from "telegraf/types";

import { Database } from "../db";
import { Button, messages } from "../db/schema";
import moment from "moment-timezone";

export const getButtons = (buttons: Button[] | Button[][]) => {
  const results: unknown[] = [];

  for (const button of buttons) {
    if (Array.isArray(button)) results.push(getButtons(button));
    else results.push(Markup.button.callback(button.name, button.data));
  }

  return results as InlineKeyboardButton[][];
};

export const processScheduledMessages = async (db: Database, bot: Telegraf) => {
  const now = moment().tz('Africa/Lagos').toDate();
  const scheduledMessages = await db.query.messages
    .findMany({
      where: lte(messages.schedule, now),
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
      await bot.telegram.sendMessage(message.user.id, message.text, {
        parse_mode: "MarkdownV2",
        reply_markup: message.buttons
          ? Markup.inlineKeyboard(getButtons(message.buttons)).reply_markup
          : undefined,
      });

      await db.delete(messages).where(eq(messages.id, message.id)).execute();
    })
  );
};
