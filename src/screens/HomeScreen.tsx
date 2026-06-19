import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdBanner } from "../components/AdBanner";
import { AppButton } from "../components/AppButton";
import {
  QuizCard,
  type QuizAnswerSheetState,
} from "../components/QuizCard";
import { useHomeQuizzes } from "../hooks/useHomeQuizzes";
import {
  listSavedAnswerSheets,
  loadAnswerSheetForQuiz,
} from "../lib/storage/answerSheetStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import {
  calculateAnswerSheetScore,
  hasAnswerSheetProgress,
  isAnswerSheetCompleted,
  TOTAL_SCORABLE_ANSWERS,
} from "../types/answerSheet";
import type { HomeScreenProps } from "../navigation/types";

const NOT_PLAYED: QuizAnswerSheetState = { status: "not-played" };

function getQuizErrorMessage(errorMessage: string | null) {
  if (errorMessage === null) {
    return null;
  }

  if (errorMessage.includes("not configured")) {
    return "Firebase is not configured, so quizzes cannot be loaded.";
  }

  if (errorMessage.includes("invalid shape")) {
    return "A Firestore quiz has invalid fields and could not be displayed.";
  }

  if (errorMessage.includes("permission-denied")) {
    return "Firestore rules blocked the quiz read.";
  }

  return "Unable to load quizzes from Firestore.";
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { nextQuiz, recentQuizzes, isLoading, errorMessage } =
    useHomeQuizzes();
  const [answerSheetStates, setAnswerSheetStates] = useState(
    new Map<string, QuizAnswerSheetState>()
  );
  const quizErrorMessage = getQuizErrorMessage(errorMessage);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function loadAnswerSheetStates() {
        const savedSheets = await listSavedAnswerSheets();
        const stateEntries = await Promise.all(
          savedSheets.map(async (savedSheet) => {
            const answerSheet = await loadAnswerSheetForQuiz(savedSheet.quizId);
            const state: QuizAnswerSheetState =
              answerSheet === null || !hasAnswerSheetProgress(answerSheet)
                ? NOT_PLAYED
                : isAnswerSheetCompleted(answerSheet)
                  ? {
                      status: "completed",
                      score: calculateAnswerSheetScore(answerSheet),
                      total: TOTAL_SCORABLE_ANSWERS,
                    }
                  : { status: "in-progress" };

            return [savedSheet.quizId, state] as const;
          })
        );

        if (isActive) {
          setAnswerSheetStates(new Map(stateEntries));
        }
      }

      void loadAnswerSheetStates();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Jay's Quiz</Text>
          <Text style={styles.subtitle}>
            Choose a quiz to watch and open its answer sheet.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <AppButton
            title="Settings"
            variant="secondary"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>

        {quizErrorMessage !== null ? (
          <Text style={styles.errorText}>{quizErrorMessage}</Text>
        ) : null}

        {isLoading ? (
          <Text style={styles.emptyText}>Loading quizzes...</Text>
        ) : (
          <>
            <View style={styles.quizSection}>
              <Text style={styles.sectionHeading}>Next Quiz</Text>
              {nextQuiz !== null ? (
                <QuizCard
                  quiz={nextQuiz}
                  answerSheetState={
                    answerSheetStates.get(nextQuiz.id) ?? NOT_PLAYED
                  }
                  onPressAnswerSheet={() =>
                    navigation.navigate("AnswerSheet", {
                      quizId: nextQuiz.id,
                      quizTitle: nextQuiz.title,
                      youtubeVideoId: nextQuiz.youtubeVideoId,
                    })
                  }
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No upcoming quiz set yet.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.quizSection}>
              <Text style={styles.sectionHeading}>Recent Quizzes</Text>
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    answerSheetState={
                      answerSheetStates.get(quiz.id) ?? NOT_PLAYED
                    }
                    onPressAnswerSheet={() =>
                      navigation.navigate("AnswerSheet", {
                        quizId: quiz.id,
                        quizTitle: quiz.title,
                        youtubeVideoId: quiz.youtubeVideoId,
                      })
                    }
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No recent quizzes are available yet.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.pastQuizzesSection}>
              <AppButton
                title="See Past Quizzes"
                variant="secondary"
                onPress={() => {
                  const excludedQuizIds = [
                    nextQuiz?.id,
                    ...recentQuizzes.map((quiz) => quiz.id),
                  ].filter((quizId): quizId is string => quizId !== undefined);

                  navigation.navigate("PastQuizzes", { excludedQuizIds });
                }}
              />
            </View>
          </>
        )}

        <View style={styles.adSection}>
          <AdBanner />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textLight,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  buttonSection: {
    marginBottom: spacing.xl,
  },
  quizSection: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 15,
    paddingVertical: spacing.xl,
    textAlign: "center",
  },
  pastQuizzesSection: {
    marginBottom: spacing.lg,
  },
  adSection: {
    marginTop: spacing.sm,
  },
});
