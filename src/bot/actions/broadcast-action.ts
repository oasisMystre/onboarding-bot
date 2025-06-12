import type { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { addButtonSceneId } from "../scenes/add-button-scene";
import { setScheduleSceneId } from "../scenes/set-schedule-scene";
import { statsAction } from "../scenes/broadcast-scene/stats-action";
import { sendMessageAction } from "../scenes/broadcast-scene/send-message-action";

export const broadcastAction = (bot: Telegraf) => {
  bot.action(/^(sendMessage|addButton|setSchedule|stats)/, (context, next) => {
    if (
      context.from.username?.toLowerCase() === getEnv("ADMIN").replace(/^@/, "")
    ) {
      const data =
        context.callbackQuery && "data" in context.callbackQuery
          ? context.callbackQuery.data
          : undefined;
      if (data) {
        if (/sendMessage/.test(data)) return sendMessageAction(context);
        else if (/addButton/.test(data))
          return context.scene.enter(addButtonSceneId);
        else if (
          /setSchedule/.test(data) &&
          !/^(setScheduleDate|setScheduleTime)/.test(data)
        )
          return context.scene.enter(setScheduleSceneId);
        else if (/stats/.test(data)) return statsAction(context);
      }
    }

    return next();
  });
};
