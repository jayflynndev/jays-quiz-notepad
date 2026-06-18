import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { SettingsScreenProps } from "../navigation/types";

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.tempText}>
        Notifications and app settings coming soon
      </Text>

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
    paddingVertical: spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tempText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  buttonSection: {
    marginTop: spacing.xl,
  },
});
