import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";
import { eq, getTableColumns } from "drizzle-orm";

import { getEnv } from "../env";
import { Database } from "../db";
import { format } from "../utils/format";
import { users, webinar } from "../db/schema";
import { updateUserById } from "../controllers/users.controller";

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const dbUsers = await db
    .selectDistinct({
      ...getTableColumns(users),
      webinar: getTableColumns(webinar),
    })
    .from(users)
    
    .innerJoin(webinar, eq(webinar.metadata, {}));

  console.log("[processing.loop.messages] users=", dbUsers.length);

  return Promise.all(
    dbUsers.flatMap(async (user) => {
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
              [Markup.button.callback("🚀 I'm Ready", "webinar")],
              [
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
