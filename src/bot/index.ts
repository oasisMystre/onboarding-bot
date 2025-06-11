import { parse } from "pg-connection-string";
import { Postgres } from "@telegraf/session/pg";
import { session, SessionStore, type Telegraf } from "telegraf";

import { stage } from "./scenes";
import { getEnv } from "../env";
import { SessionData } from "../global";
import registerActions from "./actions";
import registerCommands from "./commands";
import { authenticateUser } from "./middlewares/authenticate-user";

export default function registerBot(bot: Telegraf) {
  const config = parse(getEnv("DATABASE_URL"));
  const store: SessionStore<SessionData> = Postgres({
    user: config.user!,
    host: config.host!,
    password: config.password!,
    database: config.database!,
    config: {
      ssl: config.ssl as boolean,
    },
  });

  bot.use(
    session({
      store,
    })
  );
  bot.use(stage.middleware());
  bot.use(authenticateUser);

  registerActions(bot);
  registerCommands(bot);
}
