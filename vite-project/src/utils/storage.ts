/**
 * Browser Storage Utility
 * Handles localStorage and sessionStorage with error handling
 */

const STORAGE_KEYS = {
  WALLET_ADDRESS: "marketplace_wallet_address",
  FORM_DRAFT: "marketplace_form_draft",
  USER_PREFERENCES: "marketplace_preferences",
  LAST_PAGE: "marketplace_last_page",
} as const;

/**
 * Safely get item from localStorage
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 */
export const setLocalStorage = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded. Clearing old data...");
      clearFormDraft(); // Clear draft to free up space
    }
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// ==================== Wallet Address ====================

export const saveWalletAddress = (address: string): boolean => {
  return setLocalStorage(STORAGE_KEYS.WALLET_ADDRESS, address);
};

export const getWalletAddress = (): string | null => {
  return getLocalStorage<string | null>(STORAGE_KEYS.WALLET_ADDRESS, null);
};

export const clearWalletAddress = (): void => {
  removeLocalStorage(STORAGE_KEYS.WALLET_ADDRESS);
};

// ==================== Form Draft ====================

export const saveFormDraft = (formData: unknown): boolean => {
  return setLocalStorage(STORAGE_KEYS.FORM_DRAFT, {
    data: formData,
    timestamp: Date.now(),
  });
};

export const getFormDraft = <T>(): { data: T; timestamp: number } | null => {
  const draft = getLocalStorage<{ data: T; timestamp: number } | null>(
    STORAGE_KEYS.FORM_DRAFT,
    null
  );

  // Check if draft is older than 24 hours
  if (draft && Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
    clearFormDraft();
    return null;
  }

  return draft;
};

export const clearFormDraft = (): void => {
  removeLocalStorage(STORAGE_KEYS.FORM_DRAFT);
};

// ==================== User Preferences ====================

export interface UserPreferences {
  theme?: "dark" | "light";
  defaultView?: "grid" | "list";
  notifications?: boolean;
}

export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  const current = getUserPreferences();
  return setLocalStorage(STORAGE_KEYS.USER_PREFERENCES, {
    ...current,
    ...preferences,
  });
};

export const getUserPreferences = (): UserPreferences => {
  return getLocalStorage<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
    theme: "dark",
    defaultView: "grid",
    notifications: true,
  });
};

// ==================== Last Page ====================

export const saveLastPage = (page: string): boolean => {
  return setLocalStorage(STORAGE_KEYS.LAST_PAGE, page);
};

export const getLastPage = (): string | null => {
  return getLocalStorage<string | null>(STORAGE_KEYS.LAST_PAGE, null);
};

// ==================== Session Storage ====================

/**
 * Safely get item from sessionStorage
 */
export const getSessionStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from sessionStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in sessionStorage
 */
export const setSessionStorage = (key: string, value: unknown): boolean => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage (${key}):`, error);
    return false;
  }
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (
  type: "localStorage" | "sessionStorage"
): boolean => {
  try {
    const storage = type === "localStorage" ? localStorage : sessionStorage;
    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export default {
  saveWalletAddress,
  getWalletAddress,
  clearWalletAddress,
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
  saveUserPreferences,
  getUserPreferences,
  saveLastPage,
  getLastPage,
  clearAllStorage,
};
