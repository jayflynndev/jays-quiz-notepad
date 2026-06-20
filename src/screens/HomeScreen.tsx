import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdBanner } from "../components/AdBanner";
import { AppButton } from "../components/AppButton";
import { IconButton } from "../components/IconButton";
import { StatePanel } from "../components/StatePanel";
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
const appIcon = require("../../assets/branding/icon.png");

function getQuizErrorMessage(errorMessage: string | null) {
  if (errorMessage === null) {
    return null;
  }

  if (errorMessage.includes("not configured")) {
    return "Quiz information is not available on this device yet.";
  }

  if (errorMessage.includes("invalid shape")) {
    return "One of the latest quizzes could not be displayed.";
  }

  if (errorMessage.includes("permission-denied")) {
    return "The quiz schedule could not be accessed right now.";
  }

  return "Check your connection and try opening the app again.";
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
          <View style={styles.brandRow}>
            <Image source={appIcon} style={styles.appIcon} />
            <View style={styles.brandText}>
              <Text style={styles.eyebrow}>QUIZHUB</Text>
              <Text style={styles.title}>Jay's Quiz</Text>
            </View>
            <IconButton
              accessibilityLabel="Open Settings"
              symbol={"\u2699\uFE0E"}
              onPress={() => navigation.navigate("Settings")}
            />
          </View>
          <Text style={styles.subtitle}>
            Watch, answer and keep every score in one place.
          </Text>
        </View>

        {quizErrorMessage !== null ? (
          <StatePanel
            title="Quizzes are unavailable"
            message={quizErrorMessage}
            tone="error"
          />
        ) : null}

        {isLoading ? (
          <StatePanel
            title="Loading quizzes"
            message="Checking QuizHub for the latest schedule."
          />
        ) : (
          <>
            <View style={styles.quizSection}>
              <Text style={styles.sectionHeading}>Next Quiz</Text>
              <Text style={styles.sectionDescription}>
                Your next scheduled quiz, ready when you are.
              </Text>
              {nextQuiz !== null ? (
                <QuizCard
                  quiz={nextQuiz}
                  featured
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
                <StatePanel
                  title="No upcoming quiz set yet"
                  message="Check back soon for the next QuizHub date."
                />
              )}
            </View>

            <View style={styles.quizSection}>
              <Text style={styles.sectionHeading}>Recent Quizzes</Text>
              <Text style={styles.sectionDescription}>
                Continue an answer sheet or revisit your latest scores.
              </Text>
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
                <StatePanel
                  title="No recent quizzes"
                  message="Completed Thursday and Saturday quizzes will appear here."
                />
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
    marginBottom: spacing.xl,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  appIcon: {
    borderRadius: 8,
    height: 62,
    marginRight: spacing.md,
    width: 62,
  },
  brandText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  quizSection: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  pastQuizzesSection: {
    marginBottom: spacing.lg,
  },
  adSection: {
    marginTop: spacing.sm,
  },
});
