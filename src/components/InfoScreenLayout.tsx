import React, { type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { AppButton } from "./AppButton";

type InfoScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack: () => void;
};

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export function InfoScreenLayout({
  title,
  subtitle,
  children,
  onBack,
}: InfoScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.sections}>{children}</View>
        <AppButton title="Back to Settings" variant="secondary" onPress={onBack} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  sections: {
    marginBottom: spacing.lg,
  },
  section: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
});
