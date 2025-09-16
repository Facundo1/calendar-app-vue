import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
};
