import "dotenv/config";
import cron from "node-cron";
import { Telegraf } from "telegraf";
import fastify, { FastifyRequest, type FastifyInstance } from "fastify";

import { getEnv } from "./env";
import { db } from "./instances";
import registerBot from "./bot";
import { format } from "./utils/format";
import {
  processScheduledMessages,
  loopMessages,
  checkJoined,
  checkActions,
} from "./jobs";

async function main(server: FastifyInstance, bot: Telegraf) {
  registerBot(bot);

  const promises = [];

  bot.catch((error) => console.error(error));
  if ("RENDER_EXTERNAL_HOSTNAME" in process.env) {
    const webhook = await bot.createWebhook({
      domain: process.env.RENDER_EXTERNAL_HOSTNAME!,
    });
    server.post(
      "/telegraf/" + bot.secretPathComponent(),
      webhook as unknown as (request: FastifyRequest) => void
    );
  } else
    promises.push(
      bot.launch().then(() => console.log("bot running in background"))
    );

  promises.push(
    server.listen({
      host: process.env.HOST ? process.env.HOST : "0.0.0.0",
      port: process.env.PORT ? Number(process.env.PORT!) : 10004,
    })
  );

  cron.schedule("*/2 * * * *", () => {
    processScheduledMessages(db, bot).catch((error) => {
      console.error(error);
    });
  });

  cron.schedule("0 */2 * * *", () => {
    Promise.all([checkActions(db), loopMessages(db, bot)]).catch((error) => {
      console.error(error);
    });
  });

  cron.schedule("* * * * *", () => {
    checkJoined(db, bot).catch((error) => {
      console.error(error);
    });
  });

  return Promise.allSettled(promises);
}

const bot = new Telegraf(getEnv("TELEGRAM_ACCESS_TOKEN"));
const server = fastify({ logger: true, ignoreTrailingSlash: true });

main(server, bot);

const onPromiseError = (
  reason: Error,
  promise: NodeJS.UncaughtExceptionOrigin | Bun.UncaughtExceptionOrigin
) => console.error("Unhandled Rejection at:", promise, "reason:", reason);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.on("unhandledRejection", onPromiseError);
process.on("uncaughtException", onPromiseError);
