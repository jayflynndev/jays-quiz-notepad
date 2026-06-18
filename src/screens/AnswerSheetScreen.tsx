import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { AnswerSheetScreenProps } from "../navigation/types";

export function AnswerSheetScreen({ navigation }: AnswerSheetScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* YouTube Player Placeholder */}
      <View style={styles.youtubeContainer}>
        <Text style={styles.placeholderText}>YouTube player will go here</Text>
      </View>

      {/* Ad Banner Placeholder */}
      <View style={styles.adContainer}>
        <Text style={styles.placeholderText}>Ad banner will go here</Text>
      </View>

      {/* Answer Sheet Section */}
      <Text style={styles.heading}>Answer Sheet</Text>
      <Text style={styles.tempText}>Answer boxes coming next</Text>

      {/* Navigation Button */}
      <View style={styles.buttonSection}>
        <AppButton
          title="Back Home"
          variant="secondary"
          onPress={() => navigation.navigate("Home")}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  youtubeContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  adContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: 14,
    fontStyle: "italic",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  tempText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xl,
  },
  buttonSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
