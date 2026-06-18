import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultAppSettings,
  type AppSettings,
} from "../../types/settings";

const SETTINGS_STORAGE_KEY = "jays-quiz-notepad:settings";

function isStoredSettings(value: unknown): value is AppSettings {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.keepScreenAwakeDuringQuiz === "boolean";
}

function parseSettings(value: string): AppSettings {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!isStoredSettings(parsed)) {
      return defaultAppSettings;
    }

    return parsed;
  } catch {
    return defaultAppSettings;
  }
}

export async function loadSettings() {
  const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

  if (storedSettings === null) {
    return defaultAppSettings;
  }

  return parseSettings(storedSettings);
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
