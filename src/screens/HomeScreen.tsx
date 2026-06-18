import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AdBannerPlaceholder } from "../components/AdBannerPlaceholder";
import { AppButton } from "../components/AppButton";
import { currentQuiz, type QuizStatus } from "../config/currentQuiz";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { HomeScreenProps } from "../navigation/types";

function formatQuizStatus(status: QuizStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Jay's Quiz Notepad</Text>
        <Text style={styles.subtitle}>
          Watch the quiz and write your answers in one place.
        </Text>
      </View>

      <View style={styles.quizSection}>
        <Text style={styles.quizTitle}>{currentQuiz.title}</Text>
        <Text style={styles.quizDetail}>
          Status: {formatQuizStatus(currentQuiz.status)}
        </Text>
        <Text style={styles.quizDetail}>Start time: {currentQuiz.startTime}</Text>
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
  quizDetail: {
    color: colors.textLight,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
  adSection: {
    marginTop: spacing.lg,
  },
});
