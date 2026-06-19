import React from "react";
import { InfoScreenLayout, InfoSection } from "../components/InfoScreenLayout";
import { PRIVACY_POLICY_LAST_UPDATED } from "../config/appInfo";
import type { PrivacyPolicyScreenProps } from "../navigation/types";

export function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  return (
    <InfoScreenLayout
      title="Privacy Policy"
      subtitle={`Last updated ${PRIVACY_POLICY_LAST_UPDATED}`}
      onBack={() => navigation.navigate("Settings")}
    >
      <InfoSection title="The short version">
        Jay's Quiz does not currently have accounts or cloud answer syncing.
        Your quiz answers, marks, and scores are stored on your device. They are
        not written to Firebase.
      </InfoSection>

      <InfoSection title="Information stored on your device">
        The app stores answer sheets, marks, scores, reminder preferences, and
        the keep-screen-awake setting locally. You can clear all locally saved
        answer sheets and scores from Settings. Reminder and display settings
        are kept unless you change them separately.
      </InfoSection>

      <InfoSection title="Quiz information from Firebase">
        The app reads quiz titles, dates, times, status, and YouTube video IDs
        from Google Firebase Firestore. Jay's Quiz does not send your answers
        or scores to Firestore.
      </InfoSection>

      <InfoSection title="Advertising">
        Jay's Quiz uses Google AdMob to show banner advertisements. Google and
        its advertising partners may process information such as your device
        or advertising identifier, IP address, app interactions, and diagnostic
        information. Their use of this information is covered by Google's own
        privacy policies and your device privacy settings.
      </InfoSection>

      <InfoSection title="YouTube videos">
        Quiz videos are embedded using YouTube in a WebView. When a video is
        loaded or played, YouTube may receive information such as your IP
        address, device information, and playback interactions. YouTube's own
        privacy policy applies to that activity.
      </InfoSection>

      <InfoSection title="Notifications">
        If you enable quiz reminders, the app asks for notification permission
        and schedules reminders on your device. Reminders are optional and can
        be turned off in Settings or your device settings.
      </InfoSection>

      <InfoSection title="Accounts and future changes">
        There is currently no account or login system. A future version may add
        optional account features. If that happens, this policy will be updated
        before those features are introduced and will explain any new data use.
      </InfoSection>

      <InfoSection title="Questions">
        Use Contact Support in Settings if you have a privacy question or want
        help clearing information stored by the app.
      </InfoSection>
    </InfoScreenLayout>
  );
}
