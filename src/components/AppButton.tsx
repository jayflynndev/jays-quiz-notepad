import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface AppButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
}

export function AppButton({
  onPress,
  title,
  variant = "primary",
  style,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderWidth: 1,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text,
  },
});
