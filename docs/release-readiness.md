# Jay's Quiz release readiness

Last reviewed: 20 June 2026

This is the single source of truth for V1 store-compliance status. `Complete`
means implemented or documented in the app. `Pending` requires verification or
store-console work. `Blocked` means a required value or external setup is not
currently available.

## Advertising and consent policy

Jay's Quiz requests **non-personalised banner ads only** in every build. UMP
consent does not enable personalised advertising. Personalised ads are
unavailable in V1.

Native builds call Google UMP before the Mobile Ads SDK is initialized. A Google
form is shown when UMP says one is required, and banners are requested only when
UMP returns `canRequestAds: true`. Consent or initialization errors leave the
non-ad fallback visible. Expo Go has no native AdMob module and continues to show
the fallback.

## Release checklist

| Area | Status | Release action or evidence |
| --- | --- | --- |
| UMP consent gate | Complete | `adConsentService.ts` gathers consent before SDK initialization and ad requests. |
| Non-personalised ad requests | Complete | Every banner request sets `requestNonPersonalizedAdsOnly: true`. |
| Development ad safety | Complete | Development and preview use Google test units; production requires valid real banner units. |
| Ad formats and placement | Complete | Banner ads only; no interstitial, rewarded, app-open, or popup ads. |
| In-app privacy disclosure | Complete | Covers local sheets, Firebase, AdMob/UMP, YouTube/WebView, and notifications. |
| AdMob privacy message | Pending | Publish and verify the correct EEA/UK/Switzerland and applicable US-state message in AdMob Privacy & messaging. |
| Privacy options entry point | Pending | Wire `showAdPrivacyOptions()` into Settings when UMP reports that privacy options are required. This must be resolved before release in affected regions. |
| Native consent testing | Pending | Test first run, accept/reject, repeat launch, offline launch, and form-error behavior on Android and iOS native builds. Use UMP test-device/debug geography only in test builds. |
| AdMob account readiness | Pending | Verify both store apps, payment/profile details, app readiness review, app-ads.txt, and production App IDs/banner unit IDs. |
| Apple ads declaration | Pending | Declare that the app contains third-party advertising in App Store Connect. |
| Google Play ads declaration | Pending | Set Contains ads to Yes in Play Console. |
| Apple Privacy Labels | Pending | Complete labels from the current Google Mobile Ads, Firebase/Firestore, YouTube/WebView, and notifications SDK disclosures. Do not infer answers solely from the app's own collection. |
| Google Play Data Safety | Pending | Complete the form using current SDK data collection, sharing, encryption, deletion, and optionality details. Include AdMob and embedded YouTube processing. |
| Privacy Policy URL | Blocked | Replace this status with the final public QuizHub policy URL and verify it is reachable without login. |
| Support URL | Blocked | Provide a stable public support page URL. The in-app support email is `virtualpubquiz@yahoo.com`. |
| Age rating | Pending | Complete both store questionnaires. Consider quiz content, embedded YouTube content, advertising, and unrestricted web content classification. |
| ATT status | Pending | V1 does not request ATT and does not enable personalised ads. Confirm the current iOS Google Mobile Ads data use and App Store tracking definition before answering Privacy Labels; add ATT only if the final implementation performs tracking that requires it. |
| Firebase disclosure | Complete | Policy explains that quiz metadata is read from Firestore and answers/scores are not written there. |
| Firebase console review | Pending | Confirm production Firestore security rules permit only intended public reads and deny client writes. |
| YouTube/WebView disclosure | Complete | Policy explains that YouTube may receive device, network, and playback information. |
| YouTube compliance review | Pending | Verify embedded-player branding, controls, Terms of Service, privacy disclosure, and age-rating answers against the release build. |
| Notification disclosure | Complete | Reminders are optional and explained before permission is requested. |
| Notification store review | Pending | Verify permission timing, denial behavior, settings link, and store metadata do not imply notifications are required. |
| Local answer data | Complete | Answers, marks, and scores remain on device and can be cleared from Settings. |
| Account/data deletion | Complete | No account or cloud answer data exists; local answer data has a clear-all action. |

## Store submission blockers

1. Supply and verify the public Privacy Policy URL and Support URL.
2. Publish the required AdMob privacy messages and test UMP in native release-like builds.
3. Provide an in-app privacy-options entry point wherever UMP requires one.
4. Complete Apple Privacy Labels, Google Play Data Safety, ads declarations, and age-rating questionnaires using the SDK vendors' current disclosures.
5. Resolve the ATT declaration after reviewing the final iOS SDK behavior and Apple's current tracking definition.
6. Complete the AdMob account/app review and app-ads.txt setup.

## Verification notes

- Expo Go: expect the `AD BANNER` fallback and no UMP form because native AdMob is unavailable.
- Development/preview native builds: expect Google test banners after UMP permits requests.
- Production native builds: expect real non-personalised banners only when production IDs are configured and UMP permits requests.
- Declining consent may result in limited advertising or no banner, according to the published AdMob message and Google's eligibility decision. The app must remain usable either way.
