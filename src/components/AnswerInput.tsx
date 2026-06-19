import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerMark } from "../types/answerSheet";

interface AnswerInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  mark?: AnswerMark;
  onMarkChange?: (mark: AnswerMark) => void;
  placeholder?: string;
}

const markOptions: Array<{ label: string; value: AnswerMark }> = [
  { label: "Unmarked", value: "unmarked" },
  { label: "Correct", value: "correct" },
  { label: "Incorrect", value: "incorrect" },
];

export function AnswerInput({
  label,
  value,
  onChangeText,
  mark,
  onMarkChange,
  placeholder = "Your answer",
}: AnswerInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        returnKeyType="next"
      />
      {mark !== undefined && onMarkChange !== undefined ? (
        <View style={styles.markRow}>
          {markOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.markButton,
                mark === option.value ? styles.selectedMarkButton : null,
                mark === option.value && option.value === "correct"
                  ? styles.correctButton
                  : null,
                mark === option.value && option.value === "incorrect"
                  ? styles.incorrectButton
                  : null,
              ]}
              onPress={() => onMarkChange(option.value)}
            >
              <Text
                style={[
                  styles.markButtonText,
                  mark === option.value ? styles.selectedMarkButtonText : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  markRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  markButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  selectedMarkButton: {
    backgroundColor: colors.textMuted,
    borderColor: colors.textMuted,
  },
  correctButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  incorrectButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  markButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  selectedMarkButtonText: {
    color: colors.white,
  },
});
