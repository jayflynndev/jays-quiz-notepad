import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { PastQuizzesScreen } from "../screens/PastQuizzesScreen";
import { AnswerSheetScreen } from "../screens/AnswerSheetScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { ContactSupportScreen } from "../screens/ContactSupportScreen";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="AnswerSheet"
          component={AnswerSheetScreen}
        />
        <Stack.Screen
          name="PastQuizzes"
          component={PastQuizzesScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
        />
        <Stack.Screen
          name="ContactSupport"
          component={ContactSupportScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
