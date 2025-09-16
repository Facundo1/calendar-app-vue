import type { CalendarDay, DateString } from "../types";

const DAYS_PER_WEEK = 7;
const CALENDAR_WEEKS = 6;
const TOTAL_CALENDAR_DAYS = CALENDAR_WEEKS * DAYS_PER_WEEK;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;


function validateYearMonth(year: number, month: number): void {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error(
      `Invalid year: ${year}. Year must be between 1000 and 9999.`
    );
  }

  if (!Number.isInteger(month) || month < 0 || month > 11) {
    throw new Error(`Invalid month: ${month}. Month must be between 0 and 11.`);
  }
}


function createSafeDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${year}-${month + 1}-${day}`);
  }

  return date;
}


function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}


function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}


export function getDaysInMonth(year: number, month: number): Date[] {
  validateYearMonth(year, month);

  const days: Date[] = [];
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(createSafeDate(year, month, day));
  }

  return days;
}


export function getCalendarDays(year: number, month: number): CalendarDay[] {
  validateYearMonth(year, month);

  const firstDay = createSafeDate(year, month, 1);
  const startDayOfWeek = firstDay.getDay();

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const days: CalendarDay[] = [];

  for (let i = 0; i < TOTAL_CALENDAR_DAYS; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
    });
  }

  return days;
}


export function getCurrentMonthDays(
  year: number,
  month: number
): CalendarDay[] {
  validateYearMonth(year, month);

  const days: CalendarDay[] = [];
  const firstDay = createSafeDate(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  if (firstDayOfWeek > 0) {
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;
    const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0);
    const previousMonthDays = lastDayOfPreviousMonth.getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = previousMonthDays - i;
      const date = createSafeDate(previousYear, previousMonth, day);

      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
      });
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = createSafeDate(year, month, day);

    days.push({
      date,
      isCurrentMonth: true,
      isToday: isToday(date),
      isWeekend: isWeekend(date),
    });
  }


  const lastDayOfWeek = lastDay.getDay();
  const daysToAdd = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0;

  if (daysToAdd > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= daysToAdd; day++) {
      const date = createSafeDate(nextYear, nextMonth, day);

      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
      });
    }
  }

  return days;
}

export function getMonthName(month: number): string {
  if (!Number.isInteger(month) || month < 0 || month > 11) {
    throw new Error(`Invalid month index: ${month}. Must be between 0 and 11.`);
  }

  return MONTH_NAMES[month];
}

export function getAllMonthNames(): readonly string[] {
  return MONTH_NAMES;
}

export function getWeekDays(): readonly string[] {
  return WEEKDAY_NAMES;
}

export function getShortWeekDays(): readonly string[] {
  return WEEKDAY_NAMES.map((day) => day.slice(0, 3)) as readonly string[];
}

export function formatDateToISO(date: Date): DateString {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseISODate(dateString: DateString): Date {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoRegex.test(dateString)) {
    throw new Error(
      `Invalid ISO date format: ${dateString}. Expected YYYY-MM-DD.`
    );
  }

  const date = new Date(dateString + "T00:00:00.000Z");

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error("Both parameters must be Date objects");
  }

  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getStartOfWeek(date: Date): Date {
  if (!(date instanceof Date)) {
    throw new Error("Parameter must be a Date object");
  }

  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

export function getEndOfWeek(date: Date): Date {
  if (!(date instanceof Date)) {
    throw new Error("Parameter must be a Date object");
  }

  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
}
