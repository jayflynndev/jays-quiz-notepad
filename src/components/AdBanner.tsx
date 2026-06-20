import React, { useState } from "react";
import Constants from "expo-constants";
import {
  Platform,
  StyleSheet,
  Text,
  TurboModuleRegistry,
  View,
} from "react-native";
import { colors } from "../theme/colors";

type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

declare const require: (moduleName: string) => unknown;

function loadGoogleMobileAds(): GoogleMobileAdsModule | null {
  if (TurboModuleRegistry.get("RNGoogleMobileAdsModule") === null) {
    return null;
  }

  try {
    return require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch {
    return null;
  }
}

const googleMobileAds = loadGoogleMobileAds();

type EmbeddedAdMobConfig = {
  androidBannerUnitId: string | null;
  iosBannerUnitId: string | null;
  useProductionBannerIds: boolean;
};

function getEmbeddedAdMobConfig(): EmbeddedAdMobConfig | null {
  const extra: unknown = Constants.expoConfig?.extra;

  if (typeof extra !== "object" || extra === null) {
    return null;
  }

  const candidate = (extra as Record<string, unknown>).adMob;

  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const config = candidate as Record<string, unknown>;
  const androidBannerUnitId = config.androidBannerUnitId;
  const iosBannerUnitId = config.iosBannerUnitId;

  if (typeof config.useProductionBannerIds !== "boolean") {
    return null;
  }

  if (!config.useProductionBannerIds) {
    return {
      androidBannerUnitId: null,
      iosBannerUnitId: null,
      useProductionBannerIds: false,
    };
  }

  if (
    typeof androidBannerUnitId !== "string" ||
    typeof iosBannerUnitId !== "string"
  ) {
    return null;
  }

  return {
    androidBannerUnitId,
    iosBannerUnitId,
    useProductionBannerIds: config.useProductionBannerIds,
  };
}

function getBannerUnitId(testBannerUnitId: string) {
  const config = getEmbeddedAdMobConfig();

  if (config?.useProductionBannerIds !== true) {
    return testBannerUnitId;
  }

  if (Platform.OS === "android") {
    return config.androidBannerUnitId;
  }

  if (Platform.OS === "ios") {
    return config.iosBannerUnitId;
  }

  return null;
}

export function AdBanner() {
  const [isLoaded, setIsLoaded] = useState(false);

  if (googleMobileAds === null) {
    return <AdBannerFallback />;
  }

  const { BannerAd, BannerAdSize, TestIds } = googleMobileAds;
  const bannerUnitId = getBannerUnitId(TestIds.BANNER);

  if (bannerUnitId === null) {
    return <AdBannerFallback />;
  }

  return (
    <View style={styles.container}>
      {!isLoaded ? <AdBannerFallback /> : null}
      <View style={styles.nativeBanner}>
        <BannerAd
          unitId={bannerUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setIsLoaded(true)}
          onAdFailedToLoad={() => setIsLoaded(false)}
        />
      </View>
    </View>
  );
}

function AdBannerFallback() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>Ad banner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  nativeBanner: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
  fallback: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: "100%",
  },
  fallbackText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
