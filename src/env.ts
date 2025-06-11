import "dotenv/config";

import { format } from "./utils/format";

type Env = "CODE"|"PRODUCT_NAME"|"PROJECT_NAME"|"BOT_LINK"|"ADMIN"|"CHANNEL_ID"|"GIFT_LINK"|"CONTACT_SUPPORT"|"CHANNEL_INVITE_LINK"|"LIVE_LINK"|"TELEGRAM_ACCESS_TOKEN"|"TRADE_ACCOUNT_LINK"|"DATABASE_URL";

export const getEnv = <T extends object | number | string | null = string>(
  name: Env,
  refine?: <K extends unknown>(value: K) => T
) => {
  const value = process.env["APP_" + name] || process.env[name] ;
  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }
  throw new Error(format("% not found in env file", name));
};
