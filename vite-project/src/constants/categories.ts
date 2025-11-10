// API Category Options
export const API_CATEGORIES = [
  "Payment",
  "Weather",
  "Social",
  "Communication",
  "Data",
  "AI/ML",
  "Mapping",
  "E-commerce",
  "Finance",
  "Media",
  "Authentication",
  "Development",
  "Other",
] as const;

export type APICategory = typeof API_CATEGORIES[number];
