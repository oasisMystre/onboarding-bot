import type { Context, Scenes } from "telegraf";

import type { userSelectSchema } from "./db/zod";

type SessionData = {
  id: string;
};

type Session = SessionData;

declare module "telegraf" {
  interface Context {
    user: Zod.infer<typeof userSelectSchema>;
    session: Session;
    scene: Scenes.SceneContext["scene"];
  }
}
