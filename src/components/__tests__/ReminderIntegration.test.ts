import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import DayCell from "../DayCell.vue";
import { useRemindersStore } from "../../store/reminders";

vi.mock("../../composables/useWeather", () => ({
  useWeather: () => ({
    getWeatherWithCache: vi.fn().mockResolvedValue("Soleado 25°C"),
  }),
}));

describe("Reminder Integration Tests", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Full flow to add reminder", () => {
    it("should open modal when clicking on day cell and add reminder", async () => {
      const testDate = new Date("2024-01-15");
      const pinia = createPinia();

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [pinia],
        },
      });

      const store = useRemindersStore();

      expect(store.reminders).toHaveLength(0);

      await wrapper.find(".day-cell-content").trigger("click");

      expect(wrapper.find(".modal-overlay").exists()).toBe(true);

      const modal = wrapper.findComponent({ name: "ReminderModal" });
      expect(modal.exists()).toBe(true);

      await wrapper.find('input[id="text"]').setValue("Cita importante");
      await wrapper.find('input[id="time"]').setValue("10:30");
      await wrapper.find('input[id="city"]').setValue("Madrid");
      await wrapper.find('input[id="color"]').setValue("#ff5722");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0]).toMatchObject({
        text: "Cita importante",
        time: "10:30",
        city: "Madrid",
        color: "#ff5722",
        date: "2024-01-15",
        weather: "Soleado 25°C",
      });
      expect(store.reminders[0].id).toBeDefined();
    });

    it("should display added reminders in the day cell", async () => {
      const testDate = new Date("2024-01-15");
      const pinia = createPinia();

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [pinia],
        },
      });

      const store = useRemindersStore();

      store.addReminder({
        text: "Work meeting",
        time: "09:00",
        city: "Barcelona",
        color: "#2196f3",
        date: "2024-01-15",
        weather: "Nublado 18°C",
      });

      await wrapper.vm.$nextTick();

      const reminderElements = wrapper.findAll(".reminder");
      expect(reminderElements).toHaveLength(1);

      const reminderElement = reminderElements[0];
      expect(reminderElement.find(".reminder-text").text()).toContain(
        "09:00 - Work meeting"
      );
      expect(reminderElement.find(".weather-info").text()).toBe("Nublado 18°C");
    });

    it("should handle multiple reminders for the same day", async () => {
      const testDate = new Date("2024-01-20");
      const pinia = createPinia();

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [pinia],
        },
      });

      const store = useRemindersStore();

      const reminders = [
        {
          text: "Work breakfast",
          time: "08:00",
          city: "Madrid",
          color: "#4caf50",
          date: "2024-01-20",
          weather: "Soleado 20°C",
        },
        {
          text: "Important call",
          time: "14:00",
          city: "Valencia",
          color: "#ff9800",
          date: "2024-01-20",
          weather: "Parcialmente nublado 22°C",
        },
        {
          text: "Family dinner",
          time: "20:00",
          city: "Sevilla",
          color: "#e91e63",
          date: "2024-01-20",
          weather: "Despejado 24°C",
        },
      ];

      reminders.forEach((reminder) => store.addReminder(reminder));

      await wrapper.vm.$nextTick();

      const reminderElements = wrapper.findAll(".reminder");
      expect(reminderElements).toHaveLength(3);

      expect(reminderElements[0].find(".reminder-text").text()).toContain(
      "08:00 - Work breakfast"
      );
      expect(reminderElements[1].find(".reminder-text").text()).toContain(
        "14:00 - Important call"
      );
      expect(reminderElements[2].find(".reminder-text").text()).toContain(
        "20:00 - Family dinner"
      );
    });

    it("should validate 30 character limit in real usage", async () => {
      const testDate = new Date("2024-01-15");
      const pinia = createPinia();

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [pinia],
        },
      });
    
      const store = useRemindersStore();

      await wrapper.find(".day-cell-content").trigger("click");

      const thirtyCharText = "This is a text of exactly 30ch"
      expect(thirtyCharText.length).toBe(30);

      await wrapper.find('input[id="text"]').setValue(thirtyCharText);
      await wrapper.find('input[id="time"]').setValue("15:00");
      await wrapper.find('input[id="city"]').setValue("Zaragoza");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0].text).toBe(thirtyCharText);
      expect(store.reminders[0].text.length).toBe(30);
    });

    it("should handle city field requirement", async () => {
      const testDate = new Date("2024-01-15");

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find(".day-cell-content").trigger("click");

      await wrapper
        .find('input[id="text"]')
        .setValue("Reminder without city");
      await wrapper.find('input[id="time"]').setValue("12:00");

      const cityInput = wrapper.find('input[id="city"]');
      expect(cityInput.attributes("required")).toBeDefined();

      const form = wrapper.find("form");
      expect(form.exists()).toBe(true);
    });

    it("should edit existing reminder", async () => {
      const testDate = new Date("2024-01-15");
      const pinia = createPinia();

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [pinia],
        },
      });

      const store = useRemindersStore();

      store.addReminder({
        text: "original reminder",
        time: "10:00",
        city: "Madrid",
        color: "#2196f3",
        date: "2024-01-15",
        weather: "Soleado 22°C",
      });

      await wrapper.vm.$nextTick();

      const reminderElement = wrapper.find(".reminder");
      await reminderElement.trigger("click");

      expect(wrapper.find(".modal-overlay").exists()).toBe(true);
      expect(wrapper.find("h3").text()).toBe("Edit Reminder");

      await wrapper
        .find('input[id="text"]')
        .setValue("modified reminder");
      await wrapper.find('input[id="city"]').setValue("Barcelona");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(store.reminders).toHaveLength(1);
      expect(store.reminders[0].text).toBe("modified reminder");
      expect(store.reminders[0].city).toBe("Barcelona");
    });
  });

  describe("Extreme cases and validation", () => {
    it("should handle empty city gracefully", async () => {
      const testDate = new Date("2024-01-15");

      const wrapper = mount(DayCell, {
        props: {
          day: testDate,
        },
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find(".day-cell-content").trigger("click");

      const cityInput = wrapper.find('input[id="city"]');

      expect(cityInput.attributes("required")).toBeDefined();
      expect(cityInput.attributes("placeholder")).toBe("City");
    });

    it("should format date correctly for different dates", async () => {
      const dates = [
        new Date("2024-01-01"),
        new Date("2024-12-31"),
        new Date("2024-06-15"),
      ];

      for (const testDate of dates) {
        const pinia = createPinia();

        const wrapper = mount(DayCell, {
          props: {
            day: testDate,
          },
          global: {
            plugins: [pinia],
          },
        });

        const store = useRemindersStore();

        await wrapper.find(".day-cell-content").trigger("click");

        await wrapper.find('input[id="text"]').setValue("Test reminder");
        await wrapper.find('input[id="time"]').setValue("10:00");
        await wrapper.find('input[id="city"]').setValue("Madrid");

        await wrapper.find("form").trigger("submit.prevent");

        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 10));
    
        const expectedDate = testDate.toISOString().split("T")[0];
        const addedReminder = store.reminders.find(
          (r) => r.date === expectedDate
        );
        expect(addedReminder).toBeDefined();
        expect(addedReminder?.date).toBe(expectedDate);
      }
    });
  });
});
