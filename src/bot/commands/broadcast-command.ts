import type { Telegraf } from "telegraf";
import { broadcastSceneId } from "../scenes/broadcastScene";

export const broadcastCommand = (telegraf: Telegraf) => {
  telegraf.command("broadcast", (context) => {
    context.scene.enter(broadcastSceneId);
  });
};
