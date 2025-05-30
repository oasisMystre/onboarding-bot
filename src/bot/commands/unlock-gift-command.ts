import { readFileSync } from "fs";
import { Context, Markup, Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { cleanText } from "../../utils/format";

export const unlockGiftCommand = (bot: Telegraf) => {
  const onUnlockGift = (context: Context) => {
    return context.replyWithMarkdownV2(
      readFileSync("locale/en/webinar/flow-17.md", "utf-8")
        .replace("%name%", cleanText(context.user.name))
        .replace("%lnk%", cleanText(getEnv("GIFT_LINK")))
        .replace("%project_name%", cleanText(getEnv("PROJECT_NAME"))),
      Markup.inlineKeyboard([
        Markup.button.url("📥 Download Your Strategy Blueprint", getEnv("GIFT_LINK")),
      ])
    );
  };

  bot.command("gift", onUnlockGift);
  bot.action("gift", onUnlockGift);
};
