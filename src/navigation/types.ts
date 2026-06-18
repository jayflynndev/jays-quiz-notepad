import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  AnswerSheet:
    | {
        quizId?: string;
        quizTitle?: string | null;
        youtubeVideoId?: string | null;
      }
    | undefined;
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
