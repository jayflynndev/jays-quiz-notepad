import React, { useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import {
  Alert,
  AppState,
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
import { IconButton } from "../components/IconButton";
import { RoundSection } from "../components/RoundSection";
import { StatePanel } from "../components/StatePanel";
import { useAnswerSheetAutosave } from "../hooks/useAnswerSheetAutosave";
import { loadAnswerSheetForQuiz } from "../lib/storage/answerSheetStorage";
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
  const {
    clearSavedSheet,
    flushPendingSave,
    saveErrorMessage,
    scheduleSave,
  } = useAnswerSheetAutosave();
  const openedQuizId = route.params.quizId;
  const openedQuizTitle = route.params.quizTitle;
  const openedQuizVideoId = route.params.youtubeVideoId;
  const playerWidth = Math.max(width - spacing.lg * 2, 200);
  const playerHeight = Math.round(playerWidth * (9 / 16));
  const score = calculateAnswerSheetScore(answerSheet);
  const markedCount = ROUND_NUMBERS.reduce(
    (total, roundNumber) =>
      total +
      answerSheet.marks[roundNumber].filter((mark) => mark !== "unmarked")
        .length,
    0
  );

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
        void flushPendingSave();
      };
    }, [flushPendingSave])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        void flushPendingSave();
      }
    });

    return () => subscription.remove();
  }, [flushPendingSave]);

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

    scheduleSave({
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
    scheduleSave,
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

  async function clearAnswers() {
    shouldSkipNextSave.current = true;
    setAnswerSheet(createInitialAnswerSheet());
    await clearSavedSheet(openedQuizId);
  }

  async function returnHome() {
    await flushPendingSave();
    navigation.navigate("Home");
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
          onPress: () => {
            void clearAnswers();
          },
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
          <View style={styles.playerHeader}>
            <View style={styles.playerBackButton}>
              <IconButton
                accessibilityLabel="Return Home"
                symbol={"\u2190"}
                onPress={() => {
                  void returnHome();
                }}
              />
            </View>
            <View style={styles.liveMarker} />
            <View style={styles.playerHeaderText}>
              <Text style={styles.playerLabel}>QUIZ VIDEO</Text>
              <Text style={styles.playerTitle} numberOfLines={1}>
                {openedQuizTitle}
              </Text>
            </View>
          </View>
          <View style={styles.youtubeContainer}>
            {openedQuizVideoId !== null ? (
              <YoutubeIframe
                height={playerHeight}
                width={playerWidth}
                videoId={openedQuizVideoId}
                play={false}
              />
            ) : (
              <View style={[styles.unavailableVideo, { height: playerHeight }]}>
                <Text style={styles.unavailableVideoText}>
                  Video unavailable
                </Text>
                <Text style={styles.unavailableVideoDescription}>
                  This saved quiz does not include a valid YouTube video.
                </Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.adSection}>
            <AdBanner />
          </View>

          <Text style={styles.heading}>Answer Sheet</Text>
          <Text style={styles.quizTitle}>{openedQuizTitle}</Text>
          {saveErrorMessage !== null ? (
            <StatePanel
              title="Answers not saved"
              message={saveErrorMessage}
              tone="error"
            />
          ) : null}
          <View style={styles.scoreCard}>
            <View style={styles.scoreTextSection}>
              <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreTotal}>/ {TOTAL_SCORABLE_ANSWERS}</Text>
              </View>
            </View>
            <View style={styles.markedSummary}>
              <Text style={styles.markedNumber}>{markedCount}</Text>
              <Text style={styles.markedLabel}>answers marked</Text>
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
              onPress={() => {
                void returnHome();
              }}
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
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    shadowColor: "#24162f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  playerHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  playerBackButton: {
    marginRight: spacing.md,
  },
  liveMarker: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  playerHeaderText: {
    flex: 1,
  },
  playerLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 2,
  },
  playerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  youtubeContainer: {
    backgroundColor: colors.text,
    borderRadius: 8,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    overflow: "hidden",
  },
  adSection: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  unavailableVideo: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  unavailableVideoText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  unavailableVideoDescription: {
    color: "#d7d2dd",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  quizTitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  scoreCard: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreTextSection: {
    flex: 1,
  },
  scoreLabel: {
    color: "#e9d8f5",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  scoreRow: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  scoreNumber: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 44,
  },
  scoreTotal: {
    color: "#e9d8f5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  markedSummary: {
    alignItems: "flex-end",
    borderLeftColor: "#7f4ba7",
    borderLeftWidth: 1,
    marginLeft: spacing.md,
    paddingLeft: spacing.lg,
  },
  markedNumber: {
    color: colors.accentBackground,
    fontSize: 22,
    fontWeight: "800",
  },
  markedLabel: {
    color: "#e9d8f5",
    fontSize: 11,
    marginTop: spacing.xs,
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
