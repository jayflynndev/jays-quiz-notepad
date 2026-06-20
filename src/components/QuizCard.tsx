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
  featured?: boolean;
}

function formatQuizStatus(status: QuizStatus) {
  switch (status) {
    case "live":
      return "Quiz live";
    case "upcoming":
      return "Quiz upcoming";
    case "ended":
      return "Quiz completed";
  }
}

function formatAnswerSheetStatus(status: QuizAnswerSheetState["status"]) {
  switch (status) {
    case "not-played":
      return "Not played";
    case "in-progress":
      return "In progress";
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

function getSheetStatusStyle(status: QuizAnswerSheetState["status"]) {
  switch (status) {
    case "not-played":
      return styles.notPlayedState;
    case "in-progress":
      return styles.inProgressState;
    case "completed":
      return styles.completedState;
  }
}

function getSheetStatusTextStyle(status: QuizAnswerSheetState["status"]) {
  switch (status) {
    case "not-played":
      return styles.notPlayedStateText;
    case "in-progress":
      return styles.inProgressStateText;
    case "completed":
      return styles.completedStateText;
  }
}

export function QuizCard({
  quiz,
  answerSheetState,
  onPressAnswerSheet,
  featured = false,
}: QuizCardProps) {
  return (
    <View style={[styles.card, featured ? styles.featuredCard : null]}>
      {featured ? <View style={styles.featuredAccent} /> : null}
      {featured ? <Text style={styles.featuredLabel}>NEXT UP</Text> : null}
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{quiz.title}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(quiz.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(quiz.status)]}>
            {formatQuizStatus(quiz.status)}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleRow}>
        <Text style={styles.date}>{formatQuizDate(quiz.startTime)}</Text>
        <View style={styles.timeBadge}>
          <Text style={styles.time}>{formatQuizTime(quiz.startTime)}</Text>
        </View>
      </View>

      <View style={styles.sheetSummary}>
        <View style={styles.sheetTextSection}>
          <Text style={styles.sheetLabel}>Your answer sheet</Text>
          <View
            style={[
              styles.sheetState,
              getSheetStatusStyle(answerSheetState.status),
            ]}
          >
            <Text
              style={[
                styles.sheetStatus,
                getSheetStatusTextStyle(answerSheetState.status),
              ]}
            >
              {formatAnswerSheetStatus(answerSheetState.status)}
            </Text>
          </View>
        </View>
        {answerSheetState.status === "completed" ? (
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>YOUR SCORE</Text>
            <Text style={styles.score}>
              {answerSheetState.score}
              <Text style={styles.scoreTotal}> / {answerSheetState.total}</Text>
            </Text>
          </View>
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
    shadowColor: "#24162f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  featuredCard: {
    borderColor: colors.primary,
    borderWidth: 1,
    paddingTop: spacing.xl,
  },
  featuredAccent: {
    backgroundColor: colors.accent,
    height: 5,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  featuredLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
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
    fontSize: 11,
    fontWeight: "700",
  },
  liveBadge: {
    backgroundColor: colors.successBackground,
  },
  liveBadgeText: {
    color: colors.success,
  },
  upcomingBadge: {
    backgroundColor: colors.infoBackground,
  },
  upcomingBadgeText: {
    color: colors.info,
  },
  endedBadge: {
    backgroundColor: colors.lightGray,
  },
  endedBadgeText: {
    color: colors.textMuted,
  },
  scheduleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  date: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    marginRight: spacing.md,
  },
  timeBadge: {
    backgroundColor: colors.accentBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  time: {
    color: "#775307",
    fontSize: 14,
    fontWeight: "700",
  },
  sheetSummary: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingTop: spacing.md,
  },
  sheetTextSection: {
    alignItems: "flex-start",
    flex: 1,
  },
  sheetLabel: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  sheetStatus: {
    fontSize: 13,
    fontWeight: "700",
  },
  sheetState: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notPlayedState: {
    backgroundColor: colors.surfaceMuted,
  },
  notPlayedStateText: {
    color: colors.textMuted,
  },
  inProgressState: {
    backgroundColor: colors.accentBackground,
  },
  inProgressStateText: {
    color: "#775307",
  },
  completedState: {
    backgroundColor: colors.successBackground,
  },
  completedStateText: {
    color: colors.success,
  },
  scoreSection: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  scoreLabel: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  score: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "700",
  },
  scoreTotal: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
