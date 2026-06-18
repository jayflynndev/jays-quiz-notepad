import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AdBannerPlaceholder } from "../components/AdBannerPlaceholder";
import { AppButton } from "../components/AppButton";
import { QuizCard } from "../components/QuizCard";
import { useCurrentQuiz } from "../hooks/useCurrentQuiz";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { HomeScreenProps } from "../navigation/types";

function getQuizFallbackMessage(errorMessage: string | null) {
  if (errorMessage === null) {
    return null;
  }

  if (errorMessage.includes("not configured")) {
    return "Firebase is not configured. Showing local fallback.";
  }

  if (errorMessage.includes("not found")) {
    return "Firestore current quiz reference or quiz document was not found. Showing local fallback.";
  }

  if (errorMessage.includes("invalid shape")) {
    return "Firestore quiz reference or quiz data has invalid fields. Showing local fallback.";
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

      <QuizCard
        quiz={currentQuiz}
        isLoading={isLoading}
        fallbackMessage={fallbackMessage}
        onPressAnswerSheet={() => navigation.navigate("AnswerSheet")}
      />

      <View style={styles.buttonSection}>
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
  buttonSection: {
    marginTop: spacing.xl,
  },
  adSection: {
    marginTop: spacing.lg,
  },
});
