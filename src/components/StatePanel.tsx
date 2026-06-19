import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type StatePanelProps = {
  title: string;
  message: string;
  tone?: "neutral" | "error";
};

export function StatePanel({
  title,
  message,
  tone = "neutral",
}: StatePanelProps) {
  const isError = tone === "error";

  return (
    <View style={[styles.container, isError ? styles.errorContainer : null]}>
      <View style={[styles.marker, isError ? styles.errorMarker : null]} />
      <View style={styles.textSection}>
        <Text style={[styles.title, isError ? styles.errorTitle : null]}>
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  errorContainer: {
    backgroundColor: colors.dangerBackground,
    borderColor: "#fecaca",
  },
  marker: {
    backgroundColor: colors.accent,
    width: 5,
  },
  errorMarker: {
    backgroundColor: colors.danger,
  },
  textSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
