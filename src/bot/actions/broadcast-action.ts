import type { Telegraf } from "telegraf";

import { addButtonSceneId } from "../scenes/add-button-scene";
import { setScheduleSceneId } from "../scenes/set-schedule-scene";
import { sendMessageAction } from "../scenes/broadcast-scene/send-message-action";
import { statsAction } from "../scenes/broadcast-scene/stats-action";

export const broadcastAction = (bot: Telegraf) => {
  bot.action(/^(sendMessage|addButton|setSchedule|stats)/, (context) => {
    const data =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;
    if (data) {
      if (/sendMessage/.test(data)) return sendMessageAction(context);
      else if (/addButton/.test(data))
        return context.scene.enter(addButtonSceneId);
      else if (/setSchedule/.test(data))
        return context.scene.enter(setScheduleSceneId);
      else if (/stats/.test(data)) return statsAction(context);
    }
  });
};
