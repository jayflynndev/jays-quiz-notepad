import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  AnswerSheet: {
    quizId: string;
    quizTitle: string;
    youtubeVideoId: string | null;
  };
  PastQuizzes: { excludedQuizIds: string[] };
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export type AnswerSheetScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AnswerSheet"
>;

export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

export type PastQuizzesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PastQuizzes"
>;
