import React, { useEffect, useState } from "react";
import { Alert, View, StyleSheet, Text, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import {
  cancelQuizReminder,
  ensureQuizReminderPermissions,
  scheduleQuizReminder,
  type QuizReminderDay,
} from "../lib/notifications/quizReminders";
import { loadSettings, saveSettings } from "../lib/storage/settingsStorage";
import { clearAllSavedAnswerSheets } from "../lib/storage/answerSheetStorage";
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

  async function updateQuizReminder(day: QuizReminderDay, value: boolean) {
    if (!value) {
      const notificationId =
        day === "thursday"
          ? settings.thursdayQuizReminderId
          : settings.saturdayQuizReminderId;

      await cancelQuizReminder(notificationId);

      const nextSettings: AppSettings =
        day === "thursday"
          ? {
              ...settings,
              thursdayQuizReminderEnabled: false,
              thursdayQuizReminderId: null,
            }
          : {
              ...settings,
              saturdayQuizReminderEnabled: false,
              saturdayQuizReminderId: null,
            };

      setSettings(nextSettings);
      await saveSettings(nextSettings);
      return;
    }

    const hasPermission = await ensureQuizReminderPermissions();

    if (!hasPermission) {
      Alert.alert(
        "Notifications disabled",
        "Please allow notifications to use quiz reminders."
      );
      return;
    }

    const previousNotificationId =
      day === "thursday"
        ? settings.thursdayQuizReminderId
        : settings.saturdayQuizReminderId;

    await cancelQuizReminder(previousNotificationId);

    const notificationId = await scheduleQuizReminder(day);
    const nextSettings: AppSettings =
      day === "thursday"
        ? {
            ...settings,
            thursdayQuizReminderEnabled: true,
            thursdayQuizReminderId: notificationId,
          }
        : {
            ...settings,
            saturdayQuizReminderEnabled: true,
            saturdayQuizReminderId: notificationId,
          };

    setSettings(nextSettings);
    await saveSettings(nextSettings);
  }

  function handleClearAllLocalDataPress() {
    Alert.alert(
      "Clear all local answer data?",
      "This removes every saved answer sheet and score from this device. Your settings and reminders will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Local Data",
          style: "destructive",
          onPress: () => {
            void clearAllSavedAnswerSheets()
              .then(() => {
                Alert.alert(
                  "Local answer data cleared",
                  "All saved answer sheets and scores have been removed."
                );
              })
              .catch(() => {
                Alert.alert(
                  "Unable to clear data",
                  "Local answer data could not be cleared. Please try again."
                );
              });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeading}>Quiz screen</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextSection}>
              <Text style={styles.settingTitle}>
                Keep screen awake during quiz
              </Text>
              <Text style={styles.settingDescription}>
                Prevents your phone from sleeping while the answer sheet is
                open.
              </Text>
            </View>
            <Switch
              value={settings.keepScreenAwakeDuringQuiz}
              onValueChange={updateKeepScreenAwakeDuringQuiz}
              trackColor={{
                false: colors.borderStrong,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeading}>Reminders</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextSection}>
              <Text style={styles.settingTitle}>Thursday quiz reminder</Text>
              <Text style={styles.settingDescription}>
                Sends a local reminder every Thursday at 7:00pm.
              </Text>
            </View>
            <Switch
              value={settings.thursdayQuizReminderEnabled}
              onValueChange={(value) => {
                void updateQuizReminder("thursday", value);
              }}
              trackColor={{
                false: colors.borderStrong,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextSection}>
              <Text style={styles.settingTitle}>Saturday quiz reminder</Text>
              <Text style={styles.settingDescription}>
                Sends a local reminder every Saturday at 7:00pm.
              </Text>
            </View>
            <Switch
              value={settings.saturdayQuizReminderEnabled}
              onValueChange={(value) => {
                void updateQuizReminder("saturday", value);
              }}
              trackColor={{
                false: colors.borderStrong,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeading}>Local data</Text>
          <View style={styles.dataSection}>
            <Text style={styles.settingTitle}>Saved answer sheets</Text>
            <Text style={styles.settingDescription}>
              Remove every locally saved answer sheet and score. App settings
              and quiz reminders are not changed.
            </Text>
            <AppButton
              title="Clear All Local Data"
              variant="secondary"
              onPress={handleClearAllLocalDataPress}
            />
          </View>
        </View>

        <View style={styles.buttonSection}>
          <AppButton
            title="Back Home"
            variant="secondary"
            onPress={() => navigation.navigate("Home")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xl,
  },
  settingsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  settingTextSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  dataSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  settingDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
});
