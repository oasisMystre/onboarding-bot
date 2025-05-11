import cron from "node-cron";

import { bot, db } from "../instances";
import { loopMessages } from "./loop-messages";
import { processScheduledMessages } from "./schedule-messages";

cron.schedule("*/30 * * * * *", () => {
  processScheduledMessages(db, bot).catch((error) => {
    console.error(error);
  });
});

cron.schedule("0 */8 * * *", () => {
  loopMessages(db, bot).catch((error) => {
    console.error(error);
  });
});
