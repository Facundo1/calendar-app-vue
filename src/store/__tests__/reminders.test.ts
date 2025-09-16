import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useRemindersStore } from "../reminders";

describe("Reminders Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("addReminder", () => {
    it("should add a new reminder with all required fields", () => {
      const store = useRemindersStore();
      const reminderData = {
        text: "important reminder",
        date: "2024-01-15",
        time: "10:00",
        city: "Madrid",
        color: "#2196f3",
        weather: "Soleado",
      };

      store.addReminder(reminderData);

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0]).toMatchObject(reminderData);
      expect(store.reminders[0].id).toBeDefined();
      expect(typeof store.reminders[0].id).toBe("string");
    });

    it("should add reminder with text up to 30 characters", () => {
      const store = useRemindersStore();
      const maxLengthText = "A".repeat(30);

      const reminderData = {
        text: maxLengthText,
        date: "2024-01-15",
        time: "10:00",
        city: "Barcelona",
        color: "#ff9800",
      };

      store.addReminder(reminderData);

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0].text).toBe(maxLengthText);
      expect(store.reminders[0].text.length).toBe(30);
    });

    it("should add reminder without weather field (optional)", () => {
      const store = useRemindersStore();
      const reminderData = {
        text: "medical appointment",
        date: "2024-01-20",
        time: "14:30",
        city: "Valencia",
        color: "#4caf50",
      };

      store.addReminder(reminderData);

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0].weather).toBeUndefined();
      expect(store.reminders[0].text).toBe("medical appointment");
      expect(store.reminders[0].city).toBe("Valencia");
    });

    it("should generate unique IDs for multiple reminders", () => {
      const store = useRemindersStore();

      const reminder1 = {
        text: "First reminder",
        date: "2024-01-15",
        time: "09:00",
        city: "Madrid",
        color: "#2196f3",
      };

      const reminder2 = {
        text: "Second reminder",
        date: "2024-01-15",
        time: "15:00",
        city: "Barcelona",
        color: "#ff9800",
      };

      store.addReminder(reminder1);
      store.addReminder(reminder2);

      expect(store.reminders).toHaveLength(2);
      expect(store.reminders[0].id).not.toBe(store.reminders[1].id);
      expect(store.reminders[0].id).toBeDefined();
      expect(store.reminders[1].id).toBeDefined();
    });

    it("should add reminder with all required fields including city", () => {
      const store = useRemindersStore();
      const cities = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];

      cities.forEach((city, index) => {
        const reminderData = {
          text: `Reminder ${index + 1}`,
          date: "2024-01-15",
          time: `${10 + index}:00`,
          city: city,
          color: "#2196f3",
        };

        store.addReminder(reminderData);
      });

      expect(store.reminders).toHaveLength(5);

      cities.forEach((city, index) => {
        expect(store.reminders[index].city).toBe(city);
        expect(store.reminders[index].text).toBe(`Reminder ${index + 1}`);
      });
    });
  });

  describe("remindersByDate getter", () => {
    it("should return reminders for specific date sorted by time", () => {
      const store = useRemindersStore();

      const reminders = [
        {
          text: "Late reminder",
          date: "2024-01-15",
          time: "15:00",
          city: "Madrid",
          color: "#ff9800",
        },
        {
          text: "Early reminder",
          date: "2024-01-15",
          time: "09:00",
          city: "Barcelona",
          color: "#2196f3",
        },
        {
          text: "Medium reminder",
          date: "2024-01-15",
          time: "12:00",
          city: "Valencia",
          color: "#4caf50",
        },
        {
        text: "Other day",
          date: "2024-01-16",
          time: "10:00",
          city: "Sevilla",
          color: "#f44336",
        },
      ];

      reminders.forEach((reminder) => store.addReminder(reminder));

      const remindersForDate = store.remindersByDate("2024-01-15");

      expect(remindersForDate).toHaveLength(3);
      expect(remindersForDate[0].time).toBe("09:00");
      expect(remindersForDate[1].time).toBe("12:00");
      expect(remindersForDate[2].time).toBe("15:00");

      expect(remindersForDate.every((r) => r.date === "2024-01-15")).toBe(true);
    });

    it("should return empty array for date with no reminders", () => {
      const store = useRemindersStore();

      store.addReminder({
        text: "Reminder",
        date: "2024-01-15",
        time: "10:00",
        city: "Madrid",
        color: "#2196f3",
      });

      const remindersForEmptyDate = store.remindersByDate("2024-01-20");

      expect(remindersForEmptyDate).toHaveLength(0);
      expect(Array.isArray(remindersForEmptyDate)).toBe(true);
    });
  });

  describe("validation scenarios", () => {
    it("should handle reminder with exactly 30 character limit", () => {
      const store = useRemindersStore();
      const exactlyThirtyChars = "This text has exactly 30 chars";

      expect(exactlyThirtyChars.length).toBe(30);

      const reminderData = {
        text: exactlyThirtyChars,
        date: "2024-01-15",
        time: "10:00",
        city: "Madrid",
        color: "#2196f3",
      };

      store.addReminder(reminderData);

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0].text).toBe(exactlyThirtyChars);
    });

    it("should store all required fields correctly", () => {
      const store = useRemindersStore();
      const reminderData = {
        text: "Complete reminder",
        date: "2024-12-25",
        time: "18:30",
        city: "Zaragoza",
        color: "#9c27b0",
        weather: "Nublado",
      };

      store.addReminder(reminderData);

      const stored = store.reminders[0];
      expect(stored.text).toBe("Complete reminder");
      expect(stored.date).toBe("2024-12-25");
      expect(stored.time).toBe("18:30");
      expect(stored.city).toBe("Zaragoza");
      expect(stored.color).toBe("#9c27b0");
      expect(stored.weather).toBe("Nublado");
      expect(stored.id).toBeDefined();
    });
  });
});
