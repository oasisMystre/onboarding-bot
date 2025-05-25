import { test } from "bun:test";
import { readFileSync } from "fs";

import { bot } from "../instances";
import { getEnv } from "../env";
import { format } from "../utils/format";

test("should send messages without failing", async () => {
  for (const [index] of Array.from({ length: 20 }).entries()) {
    const path = format("locale/en/webinar/flow-%.md", index + 1);
    const path2 = format("locale/en/loop/prewebinar/flow-%.md", index + 1);
    const path3 = format("locale/en/loop/postwebinar/flow-%.md", index + 1);

    console.log(path);
    console.log(path2);
    console.log(path3);

    Promise.all([
      index >= 17
        ? undefined
        : await bot.telegram.sendMessage(
            "6061617258",
            readFileSync(path, "utf-8")
              .replace("%product_name%", getEnv("PRODUCT_NAME"))
              .replace("%name%", "Caleb"),
            {
              parse_mode: "MarkdownV2",
            }
          ),
      await bot.telegram.sendMessage(
        "6061617258",
        readFileSync(path2, "utf-8")
          .replace("%product_name%", getEnv("PRODUCT_NAME"))
          .replace("%name%", "Caleb"),
        {
          parse_mode: "MarkdownV2",
        }
      ),
      await bot.telegram.sendMessage(
        "6061617258",
        readFileSync(path3, "utf-8")
          .replace("%product_name%", getEnv("PRODUCT_NAME"))
          .replace("%name%", "Caleb"),
        {
          parse_mode: "MarkdownV2",
        }
      ),
    ]);
  }
}, 5000000000);
