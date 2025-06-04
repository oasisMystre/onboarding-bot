import { readFileSync } from "fs";
import { Context } from "telegraf";

import { db } from "../../../instances";
import { getMessageById } from "../../../controllers/message.controller";

export const statsAction = async (context: Context) => {
  const data =
    context.callbackQuery && "data" in context.callbackQuery
      ? context.callbackQuery.data
      : undefined;

  if (data) {
    const [, id] = data.split(/_/g);
    const message = await getMessageById(db, id);

    if (message) {
      return context.replyWithMarkdownV2(
        readFileSync("locale/en/tools/broadcast/stats.md", "utf-8")
          .replace("%id%", message.id)
          .replace("%sent%", message.stats ? "Yes" : "Not set")
          .replace("%success%", String(message.stats?.success))
          .replace("%failed%", String(message.stats?.failed))
      );
    }
  }
};
