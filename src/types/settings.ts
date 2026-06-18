export type AppSettings = {
  keepScreenAwakeDuringQuiz: boolean;
  thursdayQuizReminderEnabled: boolean;
  thursdayQuizReminderId: string | null;
  saturdayQuizReminderEnabled: boolean;
  saturdayQuizReminderId: string | null;
};

export const defaultAppSettings: AppSettings = {
  keepScreenAwakeDuringQuiz: false,
  thursdayQuizReminderEnabled: false,
  thursdayQuizReminderId: null,
  saturdayQuizReminderEnabled: false,
  saturdayQuizReminderId: null,
};
