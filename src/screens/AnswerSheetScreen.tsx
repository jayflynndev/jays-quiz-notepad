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
import { AdBannerPlaceholder } from "../components/AdBannerPlaceholder";
import { AnswerInput } from "../components/AnswerInput";
import { AppButton } from "../components/AppButton";
import { RoundSection } from "../components/RoundSection";
import { useCurrentQuiz } from "../hooks/useCurrentQuiz";
import {
  clearSavedAnswerSheet,
  loadAnswerSheet,
  saveAnswerSheet,
} from "../lib/storage/answerSheetStorage";
import { loadSettings } from "../lib/storage/settingsStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerSheetScreenProps } from "../navigation/types";
import {
  ROUND_NUMBERS,
  createInitialAnswerSheet,
  type AnswerSheetState,
  type RoundNumber,
} from "../types/answerSheet";

const KEEP_AWAKE_TAG = "answer-sheet-screen";

export function AnswerSheetScreen({ navigation }: AnswerSheetScreenProps) {
  const { width } = useWindowDimensions();
  const { currentQuiz } = useCurrentQuiz();
  const hasLoadedSavedAnswers = useRef(false);
  const shouldSkipNextSave = useRef(false);
  const [answerSheet, setAnswerSheet] = useState<AnswerSheetState>(
    createInitialAnswerSheet
  );
  const [keepScreenAwakeDuringQuiz, setKeepScreenAwakeDuringQuiz] =
    useState(false);
  const playerWidth = Math.max(width - spacing.lg * 2, 200);
  const playerHeight = Math.round(playerWidth * (9 / 16));

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
      const savedAnswerSheet = await loadAnswerSheet();

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
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedAnswers.current) {
      return;
    }

    if (shouldSkipNextSave.current) {
      shouldSkipNextSave.current = false;
      return;
    }

    void saveAnswerSheet(answerSheet);
  }, [answerSheet]);

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

  function clearAnswers() {
    shouldSkipNextSave.current = true;
    setAnswerSheet(createInitialAnswerSheet());
    void clearSavedAnswerSheet();
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
              videoId={currentQuiz.youtubeVideoId}
              play={false}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.adSection}>
            <AdBannerPlaceholder />
          </View>

          <Text style={styles.heading}>Answer Sheet</Text>

          {ROUND_NUMBERS.map((roundNumber) => (
            <RoundSection
              key={roundNumber}
              roundNumber={roundNumber}
              answers={answerSheet.rounds[roundNumber]}
              onAnswerChange={(answerIndex, value) =>
                updateRoundAnswer(roundNumber, answerIndex, value)
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
    paddingTop: spacing.md,
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  tieBreakerSection: {
    marginBottom: spacing.xl,
  },
  buttonSection: {
    marginBottom: spacing.lg,
  },
});
