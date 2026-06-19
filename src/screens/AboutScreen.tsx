import React from "react";
import { InfoScreenLayout, InfoSection } from "../components/InfoScreenLayout";
import {
  APP_NAME,
  APP_VERSION,
  COPYRIGHT_YEAR,
  SUPPORT_EMAIL,
} from "../config/appInfo";
import type { AboutScreenProps } from "../navigation/types";

export function AboutScreen({ navigation }: AboutScreenProps) {
  return (
    <InfoScreenLayout
      title={APP_NAME}
      subtitle={`Version ${APP_VERSION}`}
      onBack={() => navigation.navigate("Settings")}
    >
      <InfoSection title="About the app">
        Jay's Quiz lets you watch a quiz, record answers on your device, mark
        each round, and keep track of your score.
      </InfoSection>

      <InfoSection title="Support">
        For help or feedback, use Contact Support in Settings. Current support
        email: {SUPPORT_EMAIL}
      </InfoSection>

      <InfoSection title="Copyright">
        Copyright {COPYRIGHT_YEAR} Jay's Quiz and QuizHub. All rights reserved.
        YouTube content remain the property of their respective owners.
      </InfoSection>
    </InfoScreenLayout>
  );
}
