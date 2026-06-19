import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { StatePanel } from "../components/StatePanel";
import {
  listSavedAnswerSheets,
  loadAnswerSheetForQuiz,
  type SavedAnswerSheetSummary,
} from "../lib/storage/answerSheetStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { PastQuizzesScreenProps } from "../navigation/types";
import {
  calculateAnswerSheetScore,
  hasAnswerSheetProgress,
  isAnswerSheetCompleted,
  TOTAL_SCORABLE_ANSWERS,
} from "../types/answerSheet";

type PlayedState = "Not Played" | "In Progress" | "Completed";

type PastQuizItem = SavedAnswerSheetSummary & {
  playedState: PlayedState;
  score: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  timeZone: "Europe/London",
});

function formatSavedDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Saved date unavailable"
    : dateFormatter.format(date);
}

function formatSavedTime(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : timeFormatter.format(date).replace(/\s/g, "").toLowerCase();
}

function getStateStyle(state: PlayedState) {
  switch (state) {
    case "Not Played":
      return styles.notPlayedState;
    case "In Progress":
      return styles.inProgressState;
    case "Completed":
      return styles.completedState;
  }
}

function getStateTextStyle(state: PlayedState) {
  switch (state) {
    case "Not Played":
      return styles.notPlayedStateText;
    case "In Progress":
      return styles.inProgressStateText;
    case "Completed":
      return styles.completedStateText;
  }
}

export function PastQuizzesScreen({
  navigation,
  route,
}: PastQuizzesScreenProps) {
  const [items, setItems] = useState<PastQuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function loadPastQuizzes() {
        try {
          const excludedQuizIds = new Set(route.params.excludedQuizIds);
          const savedSheets = (await listSavedAnswerSheets()).filter(
            (sheet) => !excludedQuizIds.has(sheet.quizId)
          );
          const nextItems = await Promise.all(
            savedSheets.map(async (savedSheet): Promise<PastQuizItem | null> => {
              const answerSheet = await loadAnswerSheetForQuiz(
                savedSheet.quizId
              );

              if (answerSheet === null) {
                return null;
              }

              const playedState: PlayedState = isAnswerSheetCompleted(answerSheet)
                ? "Completed"
                : hasAnswerSheetProgress(answerSheet)
                  ? "In Progress"
                  : "Not Played";

              return {
                ...savedSheet,
                playedState,
                score: calculateAnswerSheetScore(answerSheet),
              };
            })
          );

          if (isActive) {
            setItems(
              nextItems.filter((item): item is PastQuizItem => item !== null)
            );
            setErrorMessage(null);
          }
        } catch {
          if (isActive) {
            setErrorMessage("Saved quizzes could not be loaded from this device.");
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      setIsLoading(true);
      void loadPastQuizzes();

      return () => {
        isActive = false;
      };
    }, [route.params.excludedQuizIds])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Past Quizzes</Text>
        <Text style={styles.subtitle}>
          Answer sheets saved on this device that are not shown on Home.
        </Text>

        {isLoading ? (
          <StatePanel
            title="Loading saved quizzes"
            message="Checking answer sheets stored on this device."
          />
        ) : errorMessage !== null ? (
          <StatePanel
            title="Saved quizzes are unavailable"
            message={errorMessage}
            tone="error"
          />
        ) : items.length === 0 ? (
          <StatePanel
            title="No past quizzes yet"
            message="Older answer sheets will appear here after they leave the Home screen."
          />
        ) : (
          items.map((item) => (
            <View key={item.quizId} style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.quizTitle ?? "Saved answer sheet"}
              </Text>
              <View style={styles.savedDetails}>
                <Text style={styles.savedDate}>
                  Saved {formatSavedDate(item.updatedAt)}
                </Text>
                {formatSavedTime(item.updatedAt).length > 0 ? (
                  <Text style={styles.savedTime}>
                    {formatSavedTime(item.updatedAt)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.stateRow}>
                <View style={[styles.stateBadge, getStateStyle(item.playedState)]}>
                  <Text
                    style={[
                      styles.stateLabel,
                      getStateTextStyle(item.playedState),
                    ]}
                  >
                    {item.playedState}
                  </Text>
                </View>
                {item.playedState === "Completed" ? (
                  <Text style={styles.score}>
                    {item.score} / {TOTAL_SCORABLE_ANSWERS}
                  </Text>
                ) : null}
              </View>
              <AppButton
                title="Open Answer Sheet"
                onPress={() =>
                  navigation.navigate("AnswerSheet", {
                    quizId: item.quizId,
                    quizTitle: item.quizTitle ?? "Saved quiz",
                    youtubeVideoId: item.youtubeVideoId,
                  })
                }
              />
            </View>
          ))
        )}

        <View style={styles.backButton}>
          <AppButton
            title="Back Home"
            variant="secondary"
            onPress={() => navigation.navigate("Home")}
          />
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    shadowColor: "#24162f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  savedDate: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
    marginRight: spacing.sm,
  },
  savedTime: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  savedDetails: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  stateRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  stateLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  stateBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notPlayedState: {
    backgroundColor: colors.surfaceMuted,
  },
  notPlayedStateText: {
    color: colors.textMuted,
  },
  inProgressState: {
    backgroundColor: colors.accentBackground,
  },
  inProgressStateText: {
    color: "#775307",
  },
  completedState: {
    backgroundColor: colors.successBackground,
  },
  completedStateText: {
    color: colors.success,
  },
  score: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  backButton: {
    marginTop: spacing.xl,
  },
});
