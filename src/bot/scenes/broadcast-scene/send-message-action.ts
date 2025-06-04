import { Context, Markup } from "telegraf";

import { db } from "../../../instances";
import { format } from "../../../utils/format";
import {
  getMessageById,
  updateMessageById,
} from "../../../controllers/message.controller";

export const sendMessageAction = async (context: Context) => {
  const data =
    context.callbackQuery && "data" in context.callbackQuery
      ? context.callbackQuery.data
      : undefined;
  if (data) {
    const [, id] = data.split(/_/g);
    const message = await getMessageById(db, id);

    if (message) {
      return [
        updateMessageById(db, id, { auto: true }),
        context.editMessageReplyMarkup(
          Markup.inlineKeyboard([
            Markup.button.callback("Message Stats", format("stats_%", id)),
          ]).reply_markup
        ),
      ];
    }
  }
};
