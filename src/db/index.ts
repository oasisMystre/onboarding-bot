import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const createDB = (url: string) => drizzle(url, { schema });
export type Database = ReturnType<typeof createDB>;
