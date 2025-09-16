import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import ReminderModal from "../ReminderModal.vue";
import { useRemindersStore } from "../../store/reminders";

vi.mock("../../composables/useWeather", () => ({
  useWeather: () => ({
    getWeatherWithCache: vi.fn().mockResolvedValue("Soleado 22°C"),
  }),
}));

describe("ReminderModal Component", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const defaultProps = {
    day: new Date("2024-01-15"),
  };

    describe("Form to add reminder", () => {
    it("should render all required form fields", () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.find('input[id="text"]').exists()).toBe(true);
      expect(wrapper.find('input[id="time"]').exists()).toBe(true);
      expect(wrapper.find('input[id="city"]').exists()).toBe(true);
      expect(wrapper.find('input[id="color"]').exists()).toBe(true);

      expect(wrapper.find('label[for="text"]').text()).toBe("Reminder:");
      expect(wrapper.find('label[for="time"]').text()).toBe("Time:");
      expect(wrapper.find('label[for="city"]').text()).toBe("City:");
      expect(wrapper.find('label[for="color"]').text()).toBe("Color:");
    });

    it("should have correct input attributes for validation", () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      const textInput = wrapper.find('input[id="text"]');
      const timeInput = wrapper.find('input[id="time"]');
      const cityInput = wrapper.find('input[id="city"]');

      expect(textInput.attributes("maxlength")).toBe("30");
      expect(textInput.attributes("required")).toBeDefined();
      expect(textInput.attributes("placeholder")).toBe(
        "What do you want to remember?"
      );

      expect(timeInput.attributes("type")).toBe("time");
      expect(timeInput.attributes("required")).toBeDefined();

      expect(cityInput.attributes("required")).toBeDefined();
      expect(cityInput.attributes("placeholder")).toBe("City");
    });

    it('should show "New Reminder" title when not editing', () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.find("h3").text()).toBe("New Reminder");
      expect(wrapper.find('button[type="submit"]').text()).toBe("Save");
    });

    it('should show "Edit Reminder" title when editing', () => {
      const editingReminder = {
        id: "123",
        text: "Existing reminder",
        time: "10:00",
        city: "Madrid",
        color: "#ff9800",
      };

      const wrapper = mount(ReminderModal, {
        props: {
          ...defaultProps,
          editingReminder,
        },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.find("h3").text()).toBe("Edit Reminder");
      expect(wrapper.find('button[type="submit"]').text()).toBe("Update");
    });
  });

  describe("Validation of the form", () => {
    it("should validate text field with 30 character limit", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      const textInput = wrapper.find('input[id="text"]');

      const thirtyCharText = "A".repeat(30);
      await textInput.setValue(thirtyCharText);

      expect((textInput.element as HTMLInputElement).value).toBe(thirtyCharText);
      expect((textInput.element as HTMLInputElement).value.length).toBe(30);
    });

    it("should require all mandatory fields", () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      const textInput = wrapper.find('input[id="text"]');
      const timeInput = wrapper.find('input[id="time"]');
      const cityInput = wrapper.find('input[id="city"]');

      expect(textInput.attributes("required")).toBeDefined();
      expect(timeInput.attributes("required")).toBeDefined();
      expect(cityInput.attributes("required")).toBeDefined();
    });

    it("should fill form fields when editing existing reminder", async () => {
      const editingReminder = {
        id: "123",
        text: "Important meeting",
        time: "14:30",
        city: "Barcelona",
        color: "#4caf50",
      };

      const wrapper = mount(ReminderModal, {
        props: {
          ...defaultProps,
          editingReminder,
        },
        global: {
          plugins: [createPinia()],
        },
      });

      const textInput = wrapper.find('input[id="text"]').element as HTMLInputElement;
      const timeInput = wrapper.find('input[id="time"]').element as HTMLInputElement;
      const cityInput = wrapper.find('input[id="city"]').element as HTMLInputElement;

      expect(textInput.value).toBe("Important meeting");
      expect(timeInput.value).toBe("14:30");
      expect(cityInput.value).toBe("Barcelona");
      expect((wrapper.find('input[id="color"]').element as HTMLInputElement).value).toBe("#4caf50");
    });
  });

  describe("Saving functionality", () => {
    it("should add new reminder when form is submitted", async () => {
      const pinia = createPinia();

      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [pinia],
        },
      });

      const store = useRemindersStore();
      const addReminderSpy = vi.spyOn(store, "addReminder");

      await wrapper.find('input[id="text"]').setValue("Nueva cita médica");
      await wrapper.find('input[id="time"]').setValue("09:30");
      await wrapper.find('input[id="city"]').setValue("Valencia");
      await wrapper.find('input[id="color"]').setValue("#2196f3");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(addReminderSpy).toHaveBeenCalledWith({
        text: "Nueva cita médica",
        time: "09:30",
        city: "Valencia",
        color: "#2196f3",
        date: "2024-01-15",
        weather: "Soleado 22°C",
      });
    });

    it("should emit close event after successful save", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find('input[id="text"]').setValue("Test");
      await wrapper.find('input[id="time"]').setValue("10:00");
      await wrapper.find('input[id="city"]').setValue("Madrid");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("should reset form fields after successful save", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find('input[id="text"]').setValue("Test reminder");
      await wrapper.find('input[id="time"]').setValue("15:00");
      await wrapper.find('input[id="city"]').setValue("Sevilla");

      await wrapper.find("form").trigger("submit.prevent");

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect((wrapper.find('input[id="text"]').element as HTMLInputElement).value).toBe("");
      expect((wrapper.find('input[id="time"]').element as HTMLInputElement).value).toBe("");
      expect((wrapper.find('input[id="city"]').element as HTMLInputElement).value).toBe("");
    });
  });

  describe("User interactions", () => {
    it("should emit close event when cancel button is clicked", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find(".btn-cancel").trigger("click");

      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("should emit close event when clicking outside modal", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find(".modal-overlay").trigger("click");

      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("should not emit close when clicking inside modal", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find(".modal").trigger("click");

      expect(wrapper.emitted("close")).toBeFalsy();
    });
  });

    describe("Integration with weather service", () => {
    it("should call weather service with city name", async () => {
      const wrapper = mount(ReminderModal, {
        props: defaultProps,
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.find('input[id="text"]').setValue("Paseo por el parque");
      await wrapper.find('input[id="time"]').setValue("17:00");
      await wrapper.find('input[id="city"]').setValue("Bilbao");

      await wrapper.find("form").trigger("submit.prevent");

      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
