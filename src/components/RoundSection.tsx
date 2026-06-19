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
  const markedCount = marks.filter((mark) => mark !== "unmarked").length;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.roundHeadingSection}>
          <View style={styles.roundNumber}>
            <Text style={styles.roundNumberText}>{roundNumber}</Text>
          </View>
          <View>
            <Text style={styles.heading}>Round {roundNumber}</Text>
            <Text style={styles.countText}>{answers.length} answers</Text>
          </View>
        </View>
        <Text style={styles.markedText}>{markedCount} marked</Text>
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
    shadowColor: "#24162f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  roundHeadingSection: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  roundNumber: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 40,
  },
  roundNumberText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  countText: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  markedText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
});
