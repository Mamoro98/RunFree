# RunFree

A free personal running tracker for iPhone. Like Strava, but $0 forever — no accounts, no subscriptions, no Apple Developer fee. Your runs live on your phone.

## What it does

- **Record** — live GPS tracking with map, distance, time, and pace. Keeps tracking with the screen off (background location).
- **History** — every run saved locally, with totals.
- **Run detail** — full route on a map, distance, time, pace, elevation gain.

## Stack (all free, no API keys)

- **Expo / React Native** (SDK 57)
- **expo-location + expo-task-manager** — GPS + background tracking (CoreLocation under the hood, `BestForNavigation`, 5 m filter, fitness activity type)
- **react-native-maps** — Apple Maps on iOS, no key, no cost
- **AsyncStorage** — runs stored on device, no backend
- No Firebase, no server, no credit card anywhere

## Run it in development

You need a **development build** (not Expo Go — Expo Go doesn't include `react-native-maps` or background location).

```bash
npm install
npx expo start --dev-client
```

## Get it on your iPhone 12 Pro Max — free, no $99 Apple fee

Build the `.ipa` in the cloud with EAS (free tier: 30 iOS builds/month), then sideload with AltStore.

### 1. Build the .ipa (no Mac needed)

```bash
npx eas login          # free Expo account (eas-cli is already a devDependency)
npx eas init           # links the project, writes extra.eas.projectId into app.json
npm run build:preview  # = eas build --profile preview --platform ios
```

When it asks about credentials, let EAS manage them. Use a **free personal Apple ID** — you do NOT need the paid Developer Program for a sideloaded personal app.

`eas.json` is already set up with three profiles:

| Profile | Command | Use |
|---|---|---|
| `development` | `npm run build:dev` | dev-client build for on-device testing (with `npm start`) |
| `preview` | `npm run build:preview` | the release `.ipa` you sideload via AltStore |
| `production` | `eas build --profile production -p ios` | App Store (needs paid Developer account) |

Download the `.ipa` from the build page when `build:preview` finishes.

### 2. Sideload with AltStore (Windows PC)

1. Install [AltStore](https://altstore.io) on your Windows PC (installs AltServer).
2. Plug in the iPhone, open AltStore on the phone.
3. In AltStore, tap **+**, pick the `.ipa`, sign in with your free Apple ID.
4. App installs. Trust it: iPhone Settings → General → VPN & Device Management → trust your Apple ID.

### The one catch

Free Apple ID certificates expire every **7 days**. AltStore auto-renews them in the background whenever your phone and PC are on the same Wi-Fi and AltServer is running. Leave AltServer running on the PC and it re-signs itself — you rarely notice.

## First launch

- Grant location **"Always"** when asked → enables screen-off run tracking.
- "While Using" also works, but tracking pauses when you lock the screen.

## Notes

- iPhone 12 Pro Max has a barometric altimeter, so elevation is decent. Gain is smoothed with a 2 m threshold to kill GPS noise.
- Distance drops sub-metre jitter and fixes with accuracy worse than 40 m.
- Everything is on-device. Delete the app = delete the data. No cloud, by design.
