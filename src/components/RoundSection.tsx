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
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Round {roundNumber}</Text>
        <Text style={styles.countText}>{answers.length} answers</Text>
      </View>
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  countText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
  },
});
