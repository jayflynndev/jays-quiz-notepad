import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { HomeScreenProps } from "../navigation/types";

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Jay's Quiz Notepad</Text>
        <Text style={styles.subtitle}>
          Watch the quiz and write your answers in one place.
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <AppButton
          title="Watch & Write Answers"
          onPress={() => navigation.navigate("AnswerSheet")}
        />
        <AppButton
          title="Settings"
          variant="secondary"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerSection: {
    marginBottom: spacing.xxl,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
});
