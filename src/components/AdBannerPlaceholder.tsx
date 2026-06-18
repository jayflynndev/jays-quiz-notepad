import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function AdBannerPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ad banner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: "100%",
  },
  text: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
