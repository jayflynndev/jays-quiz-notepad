import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdBanner } from "../components/AdBanner";
import { AppButton } from "../components/AppButton";
import { QuizCard } from "../components/QuizCard";
import { useCurrentQuiz } from "../hooks/useCurrentQuiz";
import {
  listSavedAnswerSheets,
  type SavedAnswerSheetSummary,
} from "../lib/storage/answerSheetStorage";
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

function formatSavedAt(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { currentQuiz, isLoading, errorMessage } = useCurrentQuiz();
  const [savedSheets, setSavedSheets] = useState<SavedAnswerSheetSummary[]>([]);
  const fallbackMessage = getQuizFallbackMessage(errorMessage);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function loadSavedSheets() {
        const sheets = await listSavedAnswerSheets();

        if (isActive) {
          setSavedSheets(sheets);
        }
      }

      void loadSavedSheets();

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

        {savedSheets.length > 0 ? (
          <View style={styles.previousSheetsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Previous Sheets</Text>
              <Text style={styles.sectionCount}>{savedSheets.length}</Text>
            </View>
            {savedSheets.map((sheet) => (
              <View key={sheet.quizId} style={styles.savedSheetRow}>
                <View style={styles.savedSheetText}>
                  <Text style={styles.savedSheetTitle}>
                    {sheet.quizTitle ?? "Saved answer sheet"}
                  </Text>
                  <Text style={styles.savedSheetDate}>
                    Saved {formatSavedAt(sheet.updatedAt)}
                  </Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreValue}>
                    {sheet.hasMarkedAnswers ? sheet.score : "-"}
                  </Text>
                  <Text style={styles.scoreTotal}>
                    {sheet.hasMarkedAnswers ? `/ ${sheet.total}` : "Unmarked"}
                  </Text>
                </View>
                <View style={styles.openButtonWrapper}>
                  <AppButton
                    title="Open"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate("AnswerSheet", {
                        quizId: sheet.quizId,
                        quizTitle: sheet.quizTitle,
                        youtubeVideoId: sheet.youtubeVideoId,
                      })
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.adSection}>
          <AdBanner />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginTop: spacing.lg,
  },
  previousSheetsSection: {
    marginTop: spacing.xxl,
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionCount: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  savedSheetRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  savedSheetText: {
    flex: 1,
    marginRight: spacing.md,
  },
  savedSheetTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  savedSheetDate: {
    color: colors.textLight,
    fontSize: 13,
  },
  scoreBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    marginRight: spacing.md,
    minWidth: 76,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  scoreValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  scoreTotal: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  openButtonWrapper: {
    minWidth: 88,
  },
  adSection: {
    marginTop: spacing.lg,
  },
});
