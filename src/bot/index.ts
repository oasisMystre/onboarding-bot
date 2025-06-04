import { session, type Telegraf } from "telegraf";

import { stage } from "./scenes";
import registerActions from "./actions";
import registerCommands from "./commands";
import { authenticateUser } from "./middlewares/authenticate-user";

export default function registerBot(bot: Telegraf) {
  bot.use(session());
  bot.use(stage.middleware());
  bot.use(authenticateUser);

  registerActions(bot);
  registerCommands(bot);
}
