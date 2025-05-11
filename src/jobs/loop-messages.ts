import { readFileSync } from "fs";
import { Telegraf } from "telegraf";

import { Database } from "../db";
import { format } from "../utils/format";
import { updateUser } from "../controllers/users.controller";

export const loopMessages = async (db: Database, bot: Telegraf) => {
  const users = await db.query.users.findMany();
  console.log("[processing.loop.messages] users=", users.length);

  return Promise.all(
    users.map(async (user) => {
      const loopIndex = user.loopIndex >= 20 ? 1 : user.loopIndex + 1;

      return Promise.all([
        bot.telegram.sendMessage(
          user.id,
          readFileSync(
            format("locale/en/loop/flow-%.md", loopIndex),
            "utf-8"
          ).replace("%name%", user.name!),
          {
            parse_mode: "MarkdownV2",
          }
        ),
        updateUser(db, { loopIndex }),
      ]);
    })
  );
};
