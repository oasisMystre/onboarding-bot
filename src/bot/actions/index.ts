import type { Telegraf } from "telegraf";

import onJoinAction from "./on-join-action";
import onStartAction from "./on-start-action";
import scheduleAction from "./schedule-action";
import sendLinkAction from "./send-link-action";
import { webinarAction } from "./webinar-action";
import rescheduleAction from "./reschedule-action";
import { joinedLiveAction } from "./joined-live-action";
import setScheduleTimeAction from "./set-schedule-date-action";
import setScheduleDateAction from "./set-schedule-time-action";

export default function registerActions(bot: Telegraf) {
  onJoinAction(bot);
  webinarAction(bot);
  onStartAction(bot);
  sendLinkAction(bot);
  scheduleAction(bot);
  rescheduleAction(bot);
  joinedLiveAction(bot);
  setScheduleTimeAction(bot);
  setScheduleDateAction(bot);
}
