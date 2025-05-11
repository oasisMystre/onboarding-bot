import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { getEnv } from "./src/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnv("DATABASE_URL"),
  },
});
