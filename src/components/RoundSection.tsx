import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnswerInput } from "./AnswerInput";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerMark, RoundNumber } from "../types/answerSheet";

interface RoundSectionProps {
  roundNumber: RoundNumber;
  answers: string[];
  marks: AnswerMark[];
  onAnswerChange: (answerIndex: number, value: string) => void;
  onMarkChange: (answerIndex: number, mark: AnswerMark) => void;
}

export function RoundSection({
  roundNumber,
  answers,
  marks,
  onAnswerChange,
  onMarkChange,
}: RoundSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Round {roundNumber}</Text>
      {answers.map((answer, index) => (
        <AnswerInput
          key={`${roundNumber}-${index}`}
          label={`${index + 1}.`}
          value={answer}
          onChangeText={(value) => onAnswerChange(index, value)}
          mark={marks[index]}
          onMarkChange={(mark) => onMarkChange(index, mark)}
          placeholder={`Answer ${index + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
});
