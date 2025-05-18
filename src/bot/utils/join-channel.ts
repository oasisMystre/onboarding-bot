import { Context, TelegramError } from "telegraf";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { updateUserById } from "../../controllers/users.controller";

export const joinChannel = (context: Context) =>
  context.telegram
    .approveChatJoinRequest(getEnv("CHANNEL_ID"), Number(context.user.id))
    .then(() => updateUserById(db, context.user.id, { joinedChannel: true }))
    .catch((error) => {
      if (error instanceof TelegramError) {
        if (error.description.includes("USER_ALREADT_PARTICIPANT"))
          return updateUserById(db, context.user.id, { joinedChannel: true });
        return Promise.reject(error);
      }
    });
