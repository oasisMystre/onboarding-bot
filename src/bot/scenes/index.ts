import { Scenes } from "telegraf";
import { broadcastScene } from "./broadcast-scene";

import { addButtonScene } from "./add-button-scene";
import { setScheduleScene } from "./set-schedule-scene";
import { authenticateUser } from "../middlewares/authenticate-user";

const scenes = [broadcastScene, setScheduleScene, addButtonScene];
scenes.map((scene) =>
  scene.command("cancel", (context) => context.scene.leave())
);
export const stage = new Scenes.Stage<any>(scenes);

scenes.map((scene) => {
  scene.command("cancel", (context) => context.scene.leave());
  scene.use(authenticateUser);
  scene.use((context, next) => {
    if (!context.session.broadcast)
      context.session.broadcast = {} as unknown as {
        id: string;
        messageId: number;
        actionType?: "add-button" | "set-schedule";
      };

    return next();
  });
});
