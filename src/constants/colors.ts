export const COLORS = {
  primary: "#347ac1",
  primaryDark: "#1976d2",
  secondary: "#2196f3",

  textPrimary: "#333",
  textSecondary: "#555",
  textMuted: "#666",
  textDisabled: "#ccc",

  backgroundPrimary: "#ffffff",
  backgroundSecondary: "#f5f5f5",
  backgroundMuted: "#fafafa",
  backgroundHover: "#f8f9fa",
  backgroundOverlay: "rgba(0, 0, 0, 0.5)",

  borderLight: "#eee",
  borderDefault: "#ddd",
  borderTransparent: "rgba(255, 255, 255, 0.2)",
  borderDark: "rgba(0, 0, 0, 0.1)",

  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  errorHover: "rgba(255, 68, 68, 0.9)",

  buttonCancel: "#f5f5f5",
  buttonCancelHover: "#e0e0e0",
  buttonCancelText: "#666",

  overlayLight: "rgba(240, 240, 240, 0.9)",
  overlayButton: "rgba(255, 255, 255, 0.2)",

  shadowLight: "0 1px 2px rgba(0, 0, 0, 0.1)",
  shadowMedium: "0 2px 4px rgba(0, 0, 0, 0.15)",
  shadowStrong: "0 2px 8px rgba(0, 0, 0, 0.1)",
  shadowModal: "0 4px 20px rgba(0, 0, 0, 0.15)",
  shadowFocus: "0 0 0 2px rgba(33, 150, 243, 0.2)",

  defaultReminderColor: "#2196f3",
} as const;

export type ColorKey = keyof typeof COLORS;
