import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, Switch } from "react-native";
import { AppButton } from "../components/AppButton";
import { loadSettings, saveSettings } from "../lib/storage/settingsStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { SettingsScreenProps } from "../navigation/types";
import {
  defaultAppSettings,
  type AppSettings,
} from "../types/settings";

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    let isMounted = true;

    async function restoreSettings() {
      const savedSettings = await loadSettings();

      if (isMounted) {
        setSettings(savedSettings);
      }
    }

    void restoreSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateKeepScreenAwakeDuringQuiz(value: boolean) {
    const nextSettings: AppSettings = {
      ...settings,
      keepScreenAwakeDuringQuiz: value,
    };

    setSettings(nextSettings);
    void saveSettings(nextSettings);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.settingRow}>
        <View style={styles.settingTextSection}>
          <Text style={styles.settingTitle}>Keep screen awake during quiz</Text>
          <Text style={styles.settingDescription}>
            Prevents your phone from sleeping while the answer sheet is open.
          </Text>
        </View>
        <Switch
          value={settings.keepScreenAwakeDuringQuiz}
          onValueChange={updateKeepScreenAwakeDuringQuiz}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.buttonSection}>
        <AppButton
          title="Back Home"
          variant="secondary"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  settingRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingTextSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  settingDescription: {
    color: colors.textLight,
    fontSize: 14,
    lineHeight: 24,
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
});
