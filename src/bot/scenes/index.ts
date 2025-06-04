import { Scenes } from "telegraf";
import { broadcastScene } from "./broadcastScene";
import { authenticateUser } from "bot/middlewares/authenticate-user";

const scenes = [broadcastScene];
export const stage = new Scenes.Stage<any>(scenes);

scenes.map((scene) => {
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
