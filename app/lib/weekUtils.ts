import { format, addDays, startOfWeek } from "date-fns";

/**
 * getFirstMondayOfYear(year):
 *   Find the first Monday of the given year.
 */
export function getFirstMondayOfYear(year: number): Date {
  const d = new Date(Date.UTC(year, 0, 1));
  while (d.getUTCDay() !== 1) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}


/**
 * getMondayWeekAndYear(date):
 *   Calculate the week number and year starting from the first Monday of the year.
 */
export function getMondayWeekAndYear(date: Date): { year: number; weekNumber: number } {
  const year = date.getUTCFullYear();
  const firstMonday = getFirstMondayOfYear(year);
  const nextYearFirstMonday = getFirstMondayOfYear(year + 1);

  // Check if the date falls in the first week of the next year
  if (date >= nextYearFirstMonday) {
    return { year: year + 1, weekNumber: 1 };
  }

  // Check if the date falls in the last week of the previous year
  if (date < firstMonday) {
    const prevYearFirstMonday = getFirstMondayOfYear(year - 1);
    return calcMondayWeek(date, year - 1, prevYearFirstMonday);
  }

  // Calculate week for the current year
  return calcMondayWeek(date, year, firstMonday);
}


export function calcMondayWeek(date: Date, year: number, firstMonday: Date): { year: number; weekNumber: number } {
  const diff = date.getTime() - firstMonday.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24)); // Days since first Monday
  const weekNumber = Math.floor(daysDiff / 7) + 1; // Calculate week number

  // Check if the week belongs to the next year
  const nextYearFirstMonday = getFirstMondayOfYear(year + 1);
  if (date >= nextYearFirstMonday) {
    return { year: year + 1, weekNumber: 1 };
  }

  // Return the calculated week
  return { year, weekNumber };
}


/**
 * getWeekStartAndEndDates:
 *   Calculate the start and end dates of a week.
 */
// const getWeekStartAndEndDates = (weekNumber: number, year: number) => {
//   const firstMonday = getFirstMondayOfYear(year);
//   const startDate = new Date(firstMonday);
//   startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

//   // Handle transitions into the next year
//   const nextYearFirstMonday = getFirstMondayOfYear(year + 1);
//   if (startDate >= nextYearFirstMonday) {
//     return getWeekStartAndEndDates(1, year + 1);
//   }

//   // Calculate the end date
//   const endDate = new Date(startDate);
//   endDate.setDate(startDate.getDate() + 6);

//   // Format dates
//   const formatDate = (date: Date) => {
//     const day = String(date.getUTCDate()).padStart(2, "0");
//     const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const year = date.getUTCFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   return {
//     start: formatDate(startDate),
//     end: formatDate(endDate),
//   };
// };


// Additional helper functions (unchanged but retained for legacy code)
export function getPreviousMondayWeek(date: Date = new Date()): { year: number; weekNumber: number } {
  const { year, weekNumber } = getMondayWeekAndYear(date);
  if (weekNumber > 1) {
    return { year, weekNumber: weekNumber - 1 };
  } else {
    const d = getFirstMondayOfYear(year);
    d.setDate(d.getDate() - 1);
    return getMondayWeekAndYear(d);
  }
}

export function shiftDailyQuantities(
  daily: Record<string, number>,
  daysShift: number = 7
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [dateStr, qty] of Object.entries(daily)) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + daysShift);
    result[d.toISOString().split("T")[0]] = qty;
  }
  return result;
}

export function getWeekDays() {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = [];
  for (let i = 0; i < 6; i++) {
    days.push(format(addDays(monday, i), "yyyy-MM-dd"));
  }
  return days;
}
