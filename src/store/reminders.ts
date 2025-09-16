import { defineStore } from "pinia";

export const useRemindersStore = defineStore("reminders", {
  state: () => ({
    reminders: [] as {
      id: string;
      text: string;
      date: string;
      time: string;
      city: string;
      color: string;
      weather?: string;
    }[],
  }),
  getters: {
    remindersByDate: (state) => {
      return (date: string) => {
        return state.reminders
          .filter((r) => r.date === date)
          .sort((a, b) => a.time.localeCompare(b.time));
      };
    },
  },
  actions: {
    addReminder(reminder: Omit<(typeof this.reminders)[0], "id">) {
      this.reminders.push({ ...reminder, id: crypto.randomUUID() });
    },
    editReminder(id: string, updated: Partial<(typeof this.reminders)[0]>) {
      const index = this.reminders.findIndex((r) => r.id === id);
      if (index > -1) {
        this.reminders[index] = { ...this.reminders[index], ...updated };
      }
    },
    deleteReminder(id: string) {
      this.reminders = this.reminders.filter((r) => r.id !== id);
    },
    deleteAllRemindersForDate(date: string) {
      this.reminders = this.reminders.filter((r) => r.date !== date);
    },
  },
});
