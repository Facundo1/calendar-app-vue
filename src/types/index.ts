
export interface Reminder {
  id: string;
  text: string;
  date: string; 
  time: string; 
  city: string;
  color: string;
  weather?: string;
}

export type CreateReminderInput = Omit<Reminder, 'id'>;
export type UpdateReminderInput = Partial<Omit<Reminder, 'id'>>;

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface WeatherData {
  main: string;
  description: string;
  icon: string;
  temperature: number;
}

export interface WeatherCache {
  [city: string]: string | null;
}

export interface WeatherCacheState {
  cache: WeatherCache;
  pending: string[];
}

export interface Props {
  day: Date
  editingReminder?: Reminder
}

export interface Emits {
  close: []
}


export const REMINDER_TEXT_MAX_LENGTH = 30 as const;
export const CALENDAR_WEEKS = 6 as const;
export const DAYS_PER_WEEK = 7 as const;
export const TOTAL_CALENDAR_DAYS = CALENDAR_WEEKS * DAYS_PER_WEEK;

export type ColorValue = string;
export type DateString = string; 
export type TimeString = string;
