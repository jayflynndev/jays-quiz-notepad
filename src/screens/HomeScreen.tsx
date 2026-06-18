import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AdBannerPlaceholder } from "../components/AdBannerPlaceholder";
import { AppButton } from "../components/AppButton";
import type { QuizStatus } from "../config/currentQuiz";
import { useCurrentQuiz } from "../hooks/useCurrentQuiz";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { HomeScreenProps } from "../navigation/types";

function formatQuizStatus(status: QuizStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getQuizFallbackMessage(errorMessage: string | null) {
  if (errorMessage === null) {
    return null;
  }

  if (errorMessage.includes("not configured")) {
    return "Firebase is not configured. Showing local fallback.";
  }

  if (errorMessage.includes("not found")) {
    return "Firestore document appConfig/currentQuiz was not found. Showing local fallback.";
  }

  if (errorMessage.includes("invalid shape")) {
    return "Firestore quiz data has invalid fields. Showing local fallback.";
  }

  if (errorMessage.includes("permission-denied")) {
    return "Firestore rules blocked the quiz read. Showing local fallback.";
  }

  return "Unable to load Firestore quiz. Showing local fallback.";
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { currentQuiz, isLoading, errorMessage } = useCurrentQuiz();
  const fallbackMessage = getQuizFallbackMessage(errorMessage);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Jay's Quiz Notepad</Text>
        <Text style={styles.subtitle}>
          Watch the quiz and write your answers in one place.
        </Text>
      </View>

      <View style={styles.quizSection}>
        {isLoading ? <Text style={styles.quizMeta}>Loading quiz...</Text> : null}
        <Text style={styles.quizTitle}>{currentQuiz.title}</Text>
        <Text style={styles.quizDetail}>
          Status: {formatQuizStatus(currentQuiz.status)}
        </Text>
        <Text style={styles.quizDetail}>Start time: {currentQuiz.startTime}</Text>
        {fallbackMessage !== null ? (
          <Text style={styles.errorText}>{fallbackMessage}</Text>
        ) : null}
      </View>

      <View style={styles.buttonSection}>
        <AppButton
          title="Watch & Write Answers"
          onPress={() => navigation.navigate("AnswerSheet")}
        />
        <AppButton
          title="Settings"
          variant="secondary"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      <View style={styles.adSection}>
        <AdBannerPlaceholder />
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerSection: {
    marginBottom: spacing.xxl,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 24,
  },
  quizSection: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  quizTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  quizMeta: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  quizDetail: {
    color: colors.textLight,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  errorText: {
    color: colors.textLight,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
  adSection: {
    marginTop: spacing.lg,
  },
});
