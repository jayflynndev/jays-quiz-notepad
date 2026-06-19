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
  PrivacyPolicy: undefined;
  About: undefined;
  ContactSupport: undefined;
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

export type PrivacyPolicyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PrivacyPolicy"
>;

export type AboutScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "About"
>;

export type ContactSupportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContactSupport"
>;
