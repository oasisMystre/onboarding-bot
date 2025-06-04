import { Markup } from "telegraf";
import type { InlineKeyboardButton } from "telegraf/types";

import type { Button } from "../db/schema";

export function cleanText(value: string) {
  return value
    .replace(/\_/g, "\\_")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\*/g, "\\*")
    .replace(/\|/g, "\\|")
    .replace(/\>/g, "\\>")
    .replace(/\</g, "\\<")
    .replace(/\`/g, "\\`")
    .replace(/\~/g, "\\~")
    .replace(/\#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/\-/g, "\\-")
    .replace(/\=/g, "\\=")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/\!/g, "\\!");
}

export const format = <
  T extends Array<string | number | object | null | undefined>
>(
  delimiter: string,
  ...values: T
) => {
  return String(
    values.reduce(
      (result, value) =>
        String(result).replace(/(%|%d|%s)/, value ? value.toString() : ""),
      delimiter
    )
  );
};

export const getButtons = (buttons: Button[] | Button[][]) => {
  const results: unknown[] = [];

  for (const button of buttons) {
    if (Array.isArray(button)) results.push(getButtons(button));
    else
      results.push(
        button.type === "url"
          ? Markup.button.url(button.name, button.data)
          : Markup.button.callback(button.name, button.data)
      );
  }

  return results as InlineKeyboardButton[][];
};
