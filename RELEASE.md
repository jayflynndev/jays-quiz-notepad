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

Production must use the real AdMob app IDs. Banner ads remain configured to use
Google test banner unit IDs until a later milestone explicitly changes them.

## Build commands

```text
eas build --profile development --platform android
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile preview --platform ios
eas build --profile production --platform android
eas build --profile production --platform ios
```
