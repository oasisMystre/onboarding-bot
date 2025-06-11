import type { Telegraf } from "telegraf";

import { broadcastCommand } from "./broadcast-command";
import { unlockGiftCommand } from "./unlock-gift-command";

export default function registerCommands(bot: Telegraf) {
  unlockGiftCommand(bot);
  broadcastCommand(bot);
}
