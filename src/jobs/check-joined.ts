import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { Markup, TelegramError, type Telegraf } from "telegraf";

import { getEnv } from "../env";
import { users } from "../db/schema";
import type { Database } from "../db";
import { cleanText } from "../utils/format";
import type { userInsertSchema } from "../db/zod";
import { updateUserById } from "../controllers/users.controller";

const onJoin = async (
  db: Database,
  bot: Telegraf,
  user: Zod.infer<typeof userInsertSchema>,
  sendMessage?: boolean
) => [
  updateUserById(db, user.id, { joinedChannel: true }),
  await bot.telegram.sendMessage(
    user.id,
    readFileSync("locale/en/joined-group.md", "utf-8").replace(
      "%project_name%",
      getEnv("PROJECT_NAME")
    ),
    { parse_mode: "MarkdownV2" }
  ),
  sendMessage
    ? bot.telegram.sendMessage(
        user.id,
        readFileSync("locale/en/welcome-message.md", "utf-8")
          .replace("%project_name%", cleanText(getEnv("PROJECT_NAME")))
          .replace("%product_name%", cleanText(getEnv("PRODUCT_NAME"))),
        {
          parse_mode: "MarkdownV2",
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback("⚡️ Start", "on-start"),
          ]).reply_markup,
        }
      )
    : null,
];

export const checkJoined = async (db: Database, bot: Telegraf) => {
  const unjoinedUsers = await db.query.users
    .findMany({
      where: eq(users.joinedChannel, false),
    })
    .execute();

  console.log("[processing.checked.joined] unjoined=", unjoinedUsers.length);

  return Promise.allSettled(
    unjoinedUsers.flatMap(async (user) => {
      await bot.telegram
        .approveChatJoinRequest(getEnv("CHANNEL_ID"), Number(user.id))
        .then(() => onJoin(db, bot, user, true))
        .catch((error) => {
          if (error instanceof TelegramError) {
            if (error.description.includes("USER_ALREADY_PARTICIPANT"))
              return onJoin(db, bot, user);
            return Promise.reject(error);
          }
        });
    })
  );
};
