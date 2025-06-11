import type { Telegraf } from "telegraf";
import { broadcastCommand } from "./broadcast-command";

export default function registerCommands(bot: Telegraf) {
  broadcastCommand(bot);
}
