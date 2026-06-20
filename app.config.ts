import type { ExpoConfig } from "expo/config";
import appInfo from "./src/config/appInfo.json";

const GOOGLE_SAMPLE_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const GOOGLE_SAMPLE_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
const GOOGLE_SAMPLE_PUBLISHER_PREFIX = "ca-app-pub-3940256099942544/";
const isProductionBuild = process.env.EAS_BUILD_PROFILE === "production";

function getAdMobAppId(environmentVariable: string, fallback: string) {
  const value = process.env[environmentVariable]?.trim();

  if (!value) {
    if (process.env.EAS_BUILD_PROFILE === "production") {
      throw new Error(
        `${environmentVariable} is required for production builds. Configure it in the EAS production environment.`,
      );
    }

    console.warn(
      `[AdMob] ${environmentVariable} is not set; using Google's sample App ID.`,
    );
    return fallback;
  }

  if (!/^ca-app-pub-\d+~\d+$/.test(value)) {
    throw new Error(
      `${environmentVariable} must be an AdMob App ID in ca-app-pub-...~... format.`,
    );
  }

  return value;
}

function getProductionBannerUnitId(environmentVariable: string) {
  if (!isProductionBuild) {
    return null;
  }

  const value = process.env[environmentVariable]?.trim();

  if (!value) {
    throw new Error(
      `${environmentVariable} is required for production builds. Configure it in the EAS production environment.`,
    );
  }

  if (!/^ca-app-pub-\d+\/\d+$/.test(value)) {
    throw new Error(
      `${environmentVariable} must be a banner ad unit ID in ca-app-pub-.../... format.`,
    );
  }

  if (value.startsWith(GOOGLE_SAMPLE_PUBLISHER_PREFIX)) {
    throw new Error(
      `${environmentVariable} must use a production AdMob banner unit ID, not a Google sample ID.`,
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
const androidBannerUnitId = getProductionBannerUnitId(
  "EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID",
);
const iosBannerUnitId = getProductionBannerUnitId(
  "EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID",
);

const brandingIcon = "./assets/branding/icon.png";
const splashIcon = "./assets/branding/splash-icon.png";
const brandPurple = "#5B218E";
const appIdentifier = "uk.co.quizhub.jaysquiz";

const config: ExpoConfig = {
  name: appInfo.appName,
  slug: "jays-quiz",
  version: appInfo.appVersion,
  orientation: "portrait",
  icon: brandingIcon,
  userInterfaceStyle: "light",
  newArchEnabled: true,
  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: brandPurple,
        image: splashIcon,
        imageWidth: 220,
        resizeMode: "contain",
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: androidAdMobAppId,
        iosAppId: iosAdMobAppId,
      },
    ],
  ],
  splash: {
    image: splashIcon,
    resizeMode: "contain",
    backgroundColor: brandPurple,
  },
  ios: {
    bundleIdentifier: appIdentifier,
    buildNumber: appInfo.iosBuildNumber,
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: appIdentifier,
    versionCode: appInfo.androidVersionCode,
    adaptiveIcon: {
      foregroundImage: brandingIcon,
      backgroundColor: brandPurple,
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: brandingIcon,
  },

  extra: {
    adMob: {
      useProductionBannerIds: isProductionBuild,
      ...(androidBannerUnitId === null ? {} : { androidBannerUnitId }),
      ...(iosBannerUnitId === null ? {} : { iosBannerUnitId }),
    },
    eas: {
      projectId: "cb3dadc1-47e2-4748-b740-54471038615c",
    },
  },
};

export default config;
