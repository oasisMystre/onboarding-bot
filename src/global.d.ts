import type { Context, Scenes } from "telegraf";

import type { userSelectSchema } from "./db/zod";
import { createUser } from "./controllers/users.controller";

type SessionData = {
  id: string;
};

type Session = SessionData;

declare module "telegraf" {
  interface Context {
    user: Awaited<ReturnType<typeof createUser>>;
    session: Session;
    scene: Scenes.SceneContext["scene"];
  }
}
