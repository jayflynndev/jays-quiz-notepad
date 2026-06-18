import React, { useEffect, useRef, useState } from "react";
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
import YoutubeIframe from "react-native-youtube-iframe";
import { AnswerInput } from "../components/AnswerInput";
import { AppButton } from "../components/AppButton";
import { RoundSection } from "../components/RoundSection";
import { currentQuiz } from "../config/currentQuiz";
import {
  clearSavedAnswerSheet,
  loadAnswerSheet,
  saveAnswerSheet,
} from "../lib/storage/answerSheetStorage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerSheetScreenProps } from "../navigation/types";
import {
  ROUND_NUMBERS,
  createInitialAnswerSheet,
  type AnswerSheetState,
  type RoundNumber,
} from "../types/answerSheet";

export function AnswerSheetScreen({ navigation }: AnswerSheetScreenProps) {
  const { width } = useWindowDimensions();
  const hasLoadedSavedAnswers = useRef(false);
  const shouldSkipNextSave = useRef(false);
  const [answerSheet, setAnswerSheet] = useState<AnswerSheetState>(
    createInitialAnswerSheet
  );
  const playerWidth = Math.max(width - spacing.lg * 2, 200);
  const playerHeight = Math.round(playerWidth * (9 / 16));

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
        <View style={styles.adContainer}>
          <Text style={styles.placeholderText}>Ad banner will go here</Text>
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
    </KeyboardAvoidingView>
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
  adContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: 14,
    fontStyle: "italic",
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
