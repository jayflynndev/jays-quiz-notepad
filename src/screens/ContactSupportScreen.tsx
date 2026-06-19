import React from "react";
import { InfoScreenLayout, InfoSection } from "../components/InfoScreenLayout";
import { SUPPORT_EMAIL } from "../config/appInfo";
import type { ContactSupportScreenProps } from "../navigation/types";

export function ContactSupportScreen({
  navigation,
}: ContactSupportScreenProps) {
  return (
    <InfoScreenLayout
      title="Contact Support"
      subtitle="Help with Jay's Quiz"
      onBack={() => navigation.navigate("Settings")}
    >
      <InfoSection title="Email">
        {SUPPORT_EMAIL}
      </InfoSection>

      <InfoSection title="Reporting an issue">
        Tell us what you were trying to do, what happened, and which device you
        were using. Include the quiz title and app version when relevant. A
        screenshot can also help, but please do not include private information.
      </InfoSection>

      <InfoSection title="Before contacting support">
        Try closing and reopening the app. If the issue concerns a saved answer
        sheet, avoid clearing local data until support has reviewed the problem.
        This screen shows contact details only and does not send email itself.
      </InfoSection>
    </InfoScreenLayout>
  );
}
