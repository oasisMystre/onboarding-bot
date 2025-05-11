import { Telegraf } from "telegraf";

import { getEnv } from "./env";
import registerBot from "./bot";

export const main = (bot: Telegraf) => {
  registerBot(bot);

  bot.launch(() => console.log('bot running in background'));
};

const bot = new Telegraf(getEnv("TELEGRAM_ACCESS_TOKEN"));
main(bot);
