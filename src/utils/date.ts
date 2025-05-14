import moment, { type Moment } from "moment";

export const getWeekdays = (): Moment[] => {
  const weekdays: Moment[] = [];
  let offset = 1;

  while (weekdays.length < 5) {
    const date = moment().add(offset, "days");
    const day = date.day();

    if (day !== 0 && day !== 6) weekdays.push(date);

    offset++;
  }

  return weekdays;
};

export const getWeekends = (): Moment[] => {
  const weekends: Moment[] = [];
  let offset = 1;

  while (weekends.length < 2) {
    const date = moment().add(offset, "days");
    const day = date.day();

    if (day === 0 || day === 6) weekends.push(date);

    offset++;
  }

  return weekends;
};
