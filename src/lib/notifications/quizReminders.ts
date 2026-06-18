import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const QUIZ_REMINDER_CHANNEL_ID = "quiz-reminders";
const QUIZ_REMINDER_TITLE = "Jay's Quiz Reminder";
const QUIZ_REMINDER_BODY =
  "The quiz starts in one hour. Open your answer sheet.";
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;

export type QuizReminderDay = "thursday" | "saturday";

const reminderWeekdays: Record<QuizReminderDay, number> = {
  thursday: 5,
  saturday: 7,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureQuizReminderPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(QUIZ_REMINDER_CHANNEL_ID, {
      name: "Quiz reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();

  if (existingPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.granted;
}

export async function scheduleQuizReminder(day: QuizReminderDay) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: QUIZ_REMINDER_TITLE,
      body: QUIZ_REMINDER_BODY,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      channelId: QUIZ_REMINDER_CHANNEL_ID,
      weekday: reminderWeekdays[day],
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
    },
  });
}

export async function cancelQuizReminder(notificationId: string | null) {
  if (notificationId === null) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
