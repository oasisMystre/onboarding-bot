import type { Telegraf } from "telegraf";

import { getEnv } from "../../env";
import { broadcastSceneId } from "../scenes/broadcast-scene";

export const broadcastCommand = (telegraf: Telegraf) => {
  telegraf.command("broadcast", (context) => {
    if (context.from.username !== getEnv("ADMIN").replace(/^@/, ""))
      return context.reply("Not authorized");
    return context.scene.enter(broadcastSceneId);
  });
};
