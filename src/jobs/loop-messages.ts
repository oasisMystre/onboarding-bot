import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { getEnv } from "../env";
import { Database } from "../db";
import { format } from "../utils/format";
import { updateUserById } from "../controllers/users.controller";

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const users = await db.query.users.findMany();
  console.log("[processing.loop.messages] users=", users.length);

  return Promise.allSettled(
    users.flatMap(async (user) => {
      const loopIndex = user.loopIndex >= 20 ? 1 : user.loopIndex + 1;

      return [
        bot.telegram.sendMessage(
          user.id,
          readFileSync(
            format("locale/en/loop/flow-%.md", loopIndex),
            "utf-8"
          ).replace("%name%", user.name!),
          {
            parse_mode: "MarkdownV2",
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback("🚀 I'm Ready", "webinar"),
                Markup.button.switchToChat(
                  "💬 Contact Support",
                  getEnv("ADMIN")
                ),
              ],
            ]).reply_markup,
          }
        ),
        updateUserById(db, user.id, { loopIndex }),
      ];
    })
  );
};
