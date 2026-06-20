import { TurboModuleRegistry } from "react-native";

export type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

export type AdConsentResult = {
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
};

declare const require: (moduleName: string) => unknown;

const blockedResult: AdConsentResult = {
  canRequestAds: false,
  privacyOptionsRequired: false,
};

let preparationPromise: Promise<AdConsentResult> | null = null;

export function loadGoogleMobileAds(): GoogleMobileAdsModule | null {
  const adsModule = TurboModuleRegistry.get("RNGoogleMobileAdsModule");
  const consentModule = TurboModuleRegistry.get("RNGoogleMobileAdsConsentModule");

  if (adsModule === null || consentModule === null) {
    return null;
  }

  try {
    return require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch {
    return null;
  }
}

function toConsentResult(
  consentInfo: Awaited<
    ReturnType<GoogleMobileAdsModule["AdsConsent"]["getConsentInfo"]>
  >,
): AdConsentResult {
  return {
    canRequestAds: consentInfo.canRequestAds,
    privacyOptionsRequired:
      consentInfo.privacyOptionsRequirementStatus === "REQUIRED",
  };
}

async function gatherConsentAndInitialize(
  googleMobileAds: GoogleMobileAdsModule,
): Promise<AdConsentResult> {
  let consentResult: AdConsentResult;

  try {
    consentResult = toConsentResult(
      await googleMobileAds.AdsConsent.gatherConsent(),
    );
  } catch {
    try {
      consentResult = toConsentResult(
        await googleMobileAds.AdsConsent.getConsentInfo(),
      );
    } catch {
      return blockedResult;
    }
  }

  if (!consentResult.canRequestAds) {
    return consentResult;
  }

  try {
    await googleMobileAds.default().initialize();
    return consentResult;
  } catch {
    return blockedResult;
  }
}

export function prepareGoogleMobileAds(
  googleMobileAds: GoogleMobileAdsModule,
): Promise<AdConsentResult> {
  preparationPromise ??= gatherConsentAndInitialize(googleMobileAds);
  return preparationPromise;
}

export async function showAdPrivacyOptions(): Promise<AdConsentResult> {
  const googleMobileAds = loadGoogleMobileAds();

  if (googleMobileAds === null) {
    return blockedResult;
  }

  try {
    const result = toConsentResult(
      await googleMobileAds.AdsConsent.showPrivacyOptionsForm(),
    );
    preparationPromise = Promise.resolve(result);
    return result;
  } catch {
    return blockedResult;
  }
}
