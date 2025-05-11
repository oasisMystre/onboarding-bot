import type { Context } from "telegraf";

import { db } from "../../instances";
import { format } from "../../utils/format";
import { createUser } from "../../controllers/users.controller";

export const authenticateUser = async (
  context: Context,
  next: () => Promise<void>
) => {
  const user = context.from;
  if (user) {
    const dbUser = await createUser(db, {
      id: String(user.id),
      lastLogin: new Date(),
      name: format("%%", context.from.first_name, context.from.last_name),
    });

    context.user = dbUser;

    return next();
  }
};
