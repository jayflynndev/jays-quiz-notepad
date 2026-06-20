# Release Versioning

Release identity and build numbers live in `src/config/appInfo.json`.

For every store build:

1. Change `appVersion` only when the user-facing release version changes, for
   example from `1.0.0` to `1.0.1`.
2. Increase `androidVersionCode` by at least one for every Android upload. It
   must always be greater than the version code previously uploaded to Google
   Play.
3. Increase `iosBuildNumber` for every iOS upload. Keep it as a quoted string
   and use a value greater than the previous App Store Connect build.

Internal development and preview builds should not reuse a build number that
will later be submitted to a store.

## EAS environments

Configure the variables listed in `.env.example` in the matching EAS
`development`, `preview`, and `production` environments. Local `.env` files are
ignored by Git and must not be committed.

Production must use real AdMob app IDs and real platform banner unit IDs.
Development and preview builds always use Google's test banner unit ID, even if
production banner values exist in a local or EAS environment.

Create or update each project variable for all three EAS environments. These
values are bundled into the app, so `plaintext` is appropriate; they must not be
treated as secrets.

```text
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_ADMOB_ANDROID_APP_ID --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_ADMOB_IOS_APP_ID --environment development --environment preview --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID --environment production --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID --environment production --visibility plaintext
```

Each command prompts for the value, keeping real values out of this repository
and out of copied command lines. A production EAS build stops during config
resolution if an AdMob App ID or banner unit ID is missing, malformed, or uses
Google's sample publisher ID.

## EAS project linkage

```text
npx eas-cli login
npx eas-cli init
```

Choose the correct Expo account or organisation and create or link the
`jays-quiz` project. EAS writes the resulting project ID to Expo config. Commit
that project ID because it identifies the EAS project and is not a secret.

## Build commands

```text
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```
