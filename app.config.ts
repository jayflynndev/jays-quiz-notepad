import type { ExpoConfig } from "expo/config";

const GOOGLE_SAMPLE_ANDROID_APP_ID =
  "ca-app-pub-3940256099942544~3347511713";
const GOOGLE_SAMPLE_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";

function getAdMobAppId(environmentVariable: string, fallback: string) {
  const value = process.env[environmentVariable]?.trim();

  if (!value) {
    return fallback;
  }

  if (!/^ca-app-pub-\d+~\d+$/.test(value)) {
    throw new Error(
      `${environmentVariable} must be an AdMob App ID in ca-app-pub-...~... format.`,
    );
  }

  return value;
}

const androidAdMobAppId = getAdMobAppId(
  "EXPO_PUBLIC_ADMOB_ANDROID_APP_ID",
  GOOGLE_SAMPLE_ANDROID_APP_ID,
);
const iosAdMobAppId = getAdMobAppId(
  "EXPO_PUBLIC_ADMOB_IOS_APP_ID",
  GOOGLE_SAMPLE_IOS_APP_ID,
);

const config: ExpoConfig = {
  name: "jays-quiz-notepad",
  slug: "jays-quiz-notepad",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  plugins: [
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: androidAdMobAppId,
        iosAppId: iosAdMobAppId,
      },
    ],
  ],
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: "com.jaysquiznotepad.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
};

export default config;
