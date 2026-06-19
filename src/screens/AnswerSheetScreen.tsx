import React, { useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubeIframe from "react-native-youtube-iframe";
import { AdBanner } from "../components/AdBanner";
import { AnswerInput } from "../components/AnswerInput";
import { AppButton } from "../components/AppButton";
import { RoundSection } from "../components/RoundSection";
import {
  clearSavedAnswerSheetForQuiz,
  loadAnswerSheetForQuiz,
  saveAnswerSheetForQuiz,
} from "../lib/storage/answerSheetStorage";
import { loadSettings } from "../lib/storage/settingsStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerSheetScreenProps } from "../navigation/types";
import {
  ROUND_NUMBERS,
  TOTAL_SCORABLE_ANSWERS,
  calculateAnswerSheetScore,
  createInitialAnswerSheet,
  type AnswerMark,
  type AnswerSheetState,
  type RoundNumber,
} from "../types/answerSheet";

const KEEP_AWAKE_TAG = "answer-sheet-screen";

export function AnswerSheetScreen({
  navigation,
  route,
}: AnswerSheetScreenProps) {
  const { width } = useWindowDimensions();
  const hasLoadedSavedAnswers = useRef(false);
  const shouldSkipNextSave = useRef(false);
  const [answerSheet, setAnswerSheet] = useState<AnswerSheetState>(
    createInitialAnswerSheet
  );
  const [keepScreenAwakeDuringQuiz, setKeepScreenAwakeDuringQuiz] =
    useState(false);
  const openedQuizId = route.params.quizId;
  const openedQuizTitle = route.params.quizTitle;
  const openedQuizVideoId = route.params.youtubeVideoId;
  const playerWidth = Math.max(width - spacing.lg * 2, 200);
  const playerHeight = Math.round(playerWidth * (9 / 16));
  const score = calculateAnswerSheetScore(answerSheet);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function restoreKeepAwakeSetting() {
        const savedSettings = await loadSettings();

        if (isActive) {
          setKeepScreenAwakeDuringQuiz(
            savedSettings.keepScreenAwakeDuringQuiz
          );
        }
      }

      void restoreKeepAwakeSetting();

      return () => {
        isActive = false;
        setKeepScreenAwakeDuringQuiz(false);
        void deactivateKeepAwake(KEEP_AWAKE_TAG);
      };
    }, [])
  );

  useEffect(() => {
    if (keepScreenAwakeDuringQuiz) {
      void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
      return;
    }

    void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [keepScreenAwakeDuringQuiz]);

  useEffect(() => {
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSavedAnswers() {
      hasLoadedSavedAnswers.current = false;
      shouldSkipNextSave.current = false;
      setAnswerSheet(createInitialAnswerSheet());

      const savedAnswerSheet = await loadAnswerSheetForQuiz(openedQuizId);

      if (!isMounted) {
        return;
      }

      if (savedAnswerSheet !== null) {
        setAnswerSheet(savedAnswerSheet);
      }

      hasLoadedSavedAnswers.current = true;
    }

    void restoreSavedAnswers();

    return () => {
      isMounted = false;
    };
  }, [openedQuizId]);

  useEffect(() => {
    if (
      !hasLoadedSavedAnswers.current
    ) {
      return;
    }

    if (shouldSkipNextSave.current) {
      shouldSkipNextSave.current = false;
      return;
    }

    void saveAnswerSheetForQuiz({
      quizId: openedQuizId,
      quizTitle: openedQuizTitle,
      youtubeVideoId: openedQuizVideoId,
      answerSheet,
    });
  }, [
    answerSheet,
    openedQuizId,
    openedQuizTitle,
    openedQuizVideoId,
  ]);

  function updateRoundAnswer(
    roundNumber: RoundNumber,
    answerIndex: number,
    value: string
  ) {
    setAnswerSheet((currentAnswerSheet) => ({
      ...currentAnswerSheet,
      rounds: {
        ...currentAnswerSheet.rounds,
        [roundNumber]: currentAnswerSheet.rounds[roundNumber].map(
          (answer, index) => (index === answerIndex ? value : answer)
        ),
      },
    }));
  }

  function updateTieBreaker(value: string) {
    setAnswerSheet((currentAnswerSheet) => ({
      ...currentAnswerSheet,
      tieBreaker: value,
    }));
  }

  function updateRoundAnswerMark(
    roundNumber: RoundNumber,
    answerIndex: number,
    mark: AnswerMark
  ) {
    setAnswerSheet((currentAnswerSheet) => ({
      ...currentAnswerSheet,
      marks: {
        ...currentAnswerSheet.marks,
        [roundNumber]: currentAnswerSheet.marks[roundNumber].map(
          (currentMark, index) => (index === answerIndex ? mark : currentMark)
        ),
      },
    }));
  }

  function clearAnswers() {
    shouldSkipNextSave.current = true;
    setAnswerSheet(createInitialAnswerSheet());
    void clearSavedAnswerSheetForQuiz(openedQuizId);
  }

  function handleClearAnswersPress() {
    Alert.alert(
      "Clear answers?",
      "This will remove all saved answers from this device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Answers",
          style: "destructive",
          onPress: clearAnswers,
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stickyPlayerSection}>
          <View style={styles.youtubeContainer}>
            <YoutubeIframe
              height={playerHeight}
              width={playerWidth}
              videoId={openedQuizVideoId}
              play={false}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topNavigationSection}>
            <AppButton
              title="Return Home"
              variant="secondary"
              onPress={() => navigation.navigate("Home")}
            />
          </View>

          <View style={styles.adSection}>
            <AdBanner />
          </View>

          <Text style={styles.heading}>Answer Sheet</Text>
          <Text style={styles.quizTitle}>{openedQuizTitle}</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Current score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreTotal}>/ {TOTAL_SCORABLE_ANSWERS}</Text>
            </View>
          </View>

          {ROUND_NUMBERS.map((roundNumber) => (
            <RoundSection
              key={roundNumber}
              roundNumber={roundNumber}
              answers={answerSheet.rounds[roundNumber]}
              marks={answerSheet.marks[roundNumber]}
              onAnswerChange={(answerIndex, value) =>
                updateRoundAnswer(roundNumber, answerIndex, value)
              }
              onMarkChange={(answerIndex, mark) =>
                updateRoundAnswerMark(roundNumber, answerIndex, mark)
              }
            />
          ))}

          <View style={styles.tieBreakerSection}>
            <Text style={styles.sectionHeading}>Tie-breaker</Text>
            <AnswerInput
              label="Tie-breaker answer"
              value={answerSheet.tieBreaker}
              onChangeText={updateTieBreaker}
              placeholder="Your tie-breaker answer"
            />
          </View>

          <View style={styles.buttonSection}>
            <AppButton
              title="Clear Answers"
              variant="secondary"
              onPress={handleClearAnswersPress}
            />
            <AppButton
              title="Back Home"
              variant="secondary"
              onPress={() => navigation.navigate("Home")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 160,
  },
  stickyPlayerSection: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  youtubeContainer: {
    backgroundColor: colors.text,
    borderRadius: 8,
    overflow: "hidden",
  },
  adSection: {
    marginBottom: spacing.lg,
  },
  topNavigationSection: {
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quizTitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scoreLabel: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  scoreRow: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  scoreNumber: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
  },
  scoreTotal: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  tieBreakerSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  buttonSection: {
    marginBottom: spacing.lg,
  },
});
