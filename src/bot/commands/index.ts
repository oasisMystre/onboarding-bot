import { Markup, Telegraf } from "telegraf";
import { unlockGiftCommand } from "./unlock-gift-command";


export default function registerCommands(bot: Telegraf){
    unlockGiftCommand(bot);
}