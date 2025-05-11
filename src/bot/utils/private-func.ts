import { Context } from "telegraf";

export const privateFunc =
  <T extends Context, Fn extends (context: T) => Promise<unknown>>(fn: Fn) =>
  (context: T) => {
    if (context.chat?.type === "private") return fn(context);
  };
