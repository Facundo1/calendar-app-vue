import { defineStore } from "pinia";
import type {
  Reminder,
  CreateReminderInput,
  UpdateReminderInput,
  DateString,
} from "../types";

/**
 * Validates reminder text length
 */
function validateReminderText(text: string): boolean {
  return text.trim().length > 0 && text.length <= 30;
}

/**
 * Validates date format (YYYY-MM-DD)
 */
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
}

/**
 * Validates time format (HH:MM)
 */
function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

export const useRemindersStore = defineStore("reminders", {
  state: () => ({
    reminders: [] as Reminder[],
  }),

  getters: {
    /**
     * Get reminders for a specific date, sorted by time
     */
    remindersByDate: (state) => {
      return (date: DateString): Reminder[] => {
        if (!validateDateFormat(date)) {
          console.warn(`Invalid date format: ${date}`);
          return [];
        }

        return state.reminders
          .filter((reminder: { date: string; }) => reminder.date === date)
          .sort((a: { time: string; }, b: { time: any; }) => a.time.localeCompare(b.time));
      };
    },

    /**
     * Get total count of reminders
     */
    totalReminders: (state): number => state.reminders.length,

    /**
     * Get reminders count for a specific date
     */
    reminderCountByDate: (state) => {
      return (date: DateString): number => {
        return state.reminders.filter((reminder: { date: string; }) => reminder.date === date)
          .length;
      };
    },
  },

  actions: {
    /**
     * Add a new reminder with validation
     */
    addReminder(reminderInput: CreateReminderInput): string | null {
      // Validate input
      if (!validateReminderText(reminderInput.text)) {
        throw new Error(`Reminder text must be between 1 and 30 characters`);
      }

      if (!validateDateFormat(reminderInput.date)) {
        throw new Error(`Invalid date format. Expected YYYY-MM-DD`);
      }

      if (!validateTimeFormat(reminderInput.time)) {
        throw new Error(`Invalid time format. Expected HH:MM`);
      }

      if (!reminderInput.city.trim()) {
        throw new Error(`City is required`);
      }

      const reminder: Reminder = {
        ...reminderInput,
        id: crypto.randomUUID(),
        text: reminderInput.text.trim(),
        city: reminderInput.city.trim(),
      };

      this.reminders.push(reminder);
      return reminder.id;
    },

    /**
     * Update an existing reminder
     */
    editReminder(id: string, updates: UpdateReminderInput): boolean {
      const index = this.reminders.findIndex((reminder: { id: string; }) => reminder.id === id);

      if (index === -1) {
        console.warn(`Reminder with id ${id} not found`);
        return false;
      }

      // Validate updates if provided
      if (updates.text !== undefined && !validateReminderText(updates.text)) {
        throw new Error(`Reminder text must be between 1 and 30 characters`);
      }

      if (updates.date !== undefined && !validateDateFormat(updates.date)) {
        throw new Error(`Invalid date format. Expected YYYY-MM-DD`);
      }

      if (updates.time !== undefined && !validateTimeFormat(updates.time)) {
        throw new Error(`Invalid time format. Expected HH:MM`);
      }

      if (updates.city !== undefined && !updates.city.trim()) {
        throw new Error(`City cannot be empty`);
      }

      // Apply updates
      const updatedReminder = {
        ...this.reminders[index],
        ...updates,
        // Ensure strings are trimmed
        ...(updates.text && { text: updates.text.trim() }),
        ...(updates.city && { city: updates.city.trim() }),
      };

      this.reminders[index] = updatedReminder;
      return true;
    },

    /**
     * Delete a reminder by ID
     */
    deleteReminder(id: string): boolean {
      const initialLength = this.reminders.length;
      this.reminders = this.reminders.filter((reminder: { id: string; }) => reminder.id !== id);
      return this.reminders.length < initialLength;
    },

    /**
     * Delete all reminders for a specific date
     */
    deleteAllRemindersForDate(date: DateString): number {
      if (!validateDateFormat(date)) {
        throw new Error(`Invalid date format. Expected YYYY-MM-DD`);
      }

      const initialLength = this.reminders.length;
      this.reminders = this.reminders.filter(
        (reminder: { date: string; }) => reminder.date !== date
      );
      return initialLength - this.reminders.length;
    },

    /**
     * Clear all reminders
     */
    clearAllReminders(): void {
      this.reminders = [];
    },
  },
});
