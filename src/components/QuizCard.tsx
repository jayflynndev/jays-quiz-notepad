import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { Quiz, QuizStatus } from "../config/currentQuiz";

interface QuizCardProps {
  quiz: Quiz;
  isLoading: boolean;
  fallbackMessage: string | null;
  onPressAnswerSheet: () => void;
}

function formatQuizStatus(status: QuizStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatStartTime(startTime: string) {
  const date = new Date(startTime);

  if (Number.isNaN(date.getTime())) {
    return startTime;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusBadgeStyle(status: QuizStatus) {
  switch (status) {
    case "live":
      return styles.liveBadge;
    case "upcoming":
      return styles.upcomingBadge;
    case "ended":
      return styles.endedBadge;
  }
}

function getStatusTextStyle(status: QuizStatus) {
  switch (status) {
    case "live":
      return styles.liveBadgeText;
    case "upcoming":
      return styles.upcomingBadgeText;
    case "ended":
      return styles.endedBadgeText;
  }
}

export function QuizCard({
  quiz,
  isLoading,
  fallbackMessage,
  onPressAnswerSheet,
}: QuizCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEyebrow}>
          {isLoading ? "Loading quiz" : "Current quiz"}
        </Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(quiz.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(quiz.status)]}>
            {formatQuizStatus(quiz.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{quiz.title}</Text>
      <Text style={styles.startTime}>{formatStartTime(quiz.startTime)}</Text>

      {fallbackMessage !== null ? (
        <Text style={styles.fallbackText}>{fallbackMessage}</Text>
      ) : null}

      <AppButton title="Watch & Write Answers" onPress={onPressAnswerSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  cardEyebrow: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
  },
  liveBadge: {
    backgroundColor: "#dcfce7",
  },
  liveBadgeText: {
    color: "#166534",
  },
  upcomingBadge: {
    backgroundColor: "#dbeafe",
  },
  upcomingBadgeText: {
    color: "#1d4ed8",
  },
  endedBadge: {
    backgroundColor: colors.lightGray,
  },
  endedBadgeText: {
    color: colors.textLight,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  startTime: {
    color: colors.textLight,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  fallbackText: {
    color: colors.textLight,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
