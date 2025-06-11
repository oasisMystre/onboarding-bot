import type z from "zod";
import { Markup } from "telegraf";

import { messageSelectSchema } from "../../../db/zod";
import { format } from "../../../utils/format";

export const getBroadcastControls = (
  id: z.infer<typeof messageSelectSchema>["id"]
) => [
  [Markup.button.callback("⌛️ Set Schedule", format("setSchedule_%", id))],
  [Markup.button.callback("➕ Add Button", format("addButton_%", id))],
  [Markup.button.callback("📥 Send Message", format("sendMessage_%", id))],
];
