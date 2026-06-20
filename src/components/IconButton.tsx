import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type IconButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
  symbol: string;
};

export function IconButton({
  accessibilityLabel,
  onPress,
  symbol,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressedButton : null,
      ]}
    >
      <Text style={styles.symbol}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pressedButton: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  symbol: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 27,
    textAlign: "center",
  },
});
