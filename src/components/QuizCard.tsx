import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { Quiz, QuizStatus } from "../config/currentQuiz";

export type QuizAnswerSheetState =
  | { status: "not-played" }
  | { status: "in-progress" }
  | { status: "completed"; score: number; total: number };

interface QuizCardProps {
  quiz: Quiz;
  answerSheetState: QuizAnswerSheetState;
  onPressAnswerSheet: () => void;
}

function formatQuizStatus(status: QuizStatus) {
  switch (status) {
    case "live":
      return "Live";
    case "upcoming":
      return "Upcoming";
    case "ended":
      return "Completed";
  }
}

function formatAnswerSheetStatus(status: QuizAnswerSheetState["status"]) {
  switch (status) {
    case "not-played":
      return "Not Played";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
  }
}

function getQuizDate(startTime: string) {
  const date = new Date(startTime);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatQuizDate(startTime: string) {
  const date = getQuizDate(startTime);

  if (date === null) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date);
}

function formatQuizTime(startTime: string) {
  const date = getQuizDate(startTime);

  if (date === null) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  })
    .format(date)
    .replace(/\s/g, "")
    .toLowerCase();
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
  answerSheetState,
  onPressAnswerSheet,
}: QuizCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{quiz.title}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(quiz.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(quiz.status)]}>
            {formatQuizStatus(quiz.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{formatQuizDate(quiz.startTime)}</Text>
      <Text style={styles.time}>{formatQuizTime(quiz.startTime)}</Text>

      <View style={styles.sheetSummary}>
        <View>
          <Text style={styles.sheetLabel}>Answer sheet</Text>
          <Text style={styles.sheetStatus}>
            {formatAnswerSheetStatus(answerSheetState.status)}
          </Text>
        </View>
        {answerSheetState.status === "completed" ? (
          <Text style={styles.score}>
            {answerSheetState.score} / {answerSheetState.total}
          </Text>
        ) : null}
      </View>

      <AppButton
        title="Open Answer Sheet"
        onPress={onPressAnswerSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
    marginRight: spacing.md,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  liveBadge: {
    backgroundColor: colors.successBackground,
  },
  liveBadgeText: {
    color: colors.success,
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
    color: colors.textMuted,
  },
  date: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  sheetSummary: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sheetLabel: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  sheetStatus: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  score: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
});
