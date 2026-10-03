# CrowdLens

CrowdLens is an Android-first Solana Mobile app for requesting fresh real-world information from people who are physically near a location.

A requester creates a mission such as **“Is this event live right now?”** A nearby scout goes to the location, passes a GPS Proof of Presence check, captures fresh evidence inside the CrowdLens camera, signs the proof with a Solana wallet, and submits it for requester review.

## Core MVP flow

1. Discover or create a mission.
2. Open the mission and start Proof of Presence.
3. Grant precise Android location permission.
4. CrowdLens checks GPS accuracy, geofence distance and repeated location readings.
5. Capture proof only through the in-app camera; gallery uploads are not part of the verification flow.
6. GPS is checked again at the exact moment of capture.
7. Sign the proof payload with Solana Mobile Wallet Adapter.
8. Submit proof to the requester review screen.
9. Requester approves or rejects the proof.
10. Approval creates a Solana Devnet transaction receipt. Reward accounting is simulated for the hackathon demo until token escrow is connected.

## Mobile-specific features

- Native Android app / APK workflow
- Precise foreground GPS permission
- Configurable 25 m / 50 m / 100 m mission geofence
- Three consistent location readings before verification
- Android mock-location flag check
- In-app live camera capture
- No gallery-upload path for verified evidence
- Random capture instruction generated for the mission
- GPS re-check when the shutter is pressed
- Solana Mobile Wallet Adapter connection
- Wallet-signed proof payload
- Solana Devnet approval transaction receipt
- Local mission creation and persistence for the hackathon demo

## Stack

- React Native + Expo
- Expo Router
- Expo Location
- Expo Camera
- Solana Kit
- Solana Mobile Wallet Adapter via `@wallet-ui/react-native-kit`
- Solana Devnet
- React Native MMKV
- HeroUI Native / Uniwind

## Run locally

```bash
npm install
npm run android
```

Use an Android development build rather than Expo Go because CrowdLens depends on native Android modules and Mobile Wallet Adapter.

If the Android package name or native permissions changed since your last build, regenerate the native project first:

```bash
npx expo prebuild --clean -p android
npm run android
```

## Test the full mission flow

Open:

**Missions → choose a mission → Start location check**

On an emulator, grant location permission. After the first location reading, use the development-only button:

**Set mission point to current emulator location**

Wait for three valid readings. When CrowdLens shows **You are on-site**, continue to the live camera.

On a real Android phone, use a mission whose pinned coordinates match your test location, or create a mission and tap **Pin current GPS location**.

Allow camera access, capture proof, connect a compatible Solana Mobile wallet, sign the proof, then tap **Submit proof**. On the requester review screen, connect a wallet with a small amount of Devnet SOL for transaction fees and tap **Approve** to write the approval receipt on Solana Devnet.

## Shareable Android tester APK

CrowdLens is configured for Expo EAS internal distribution through `eas.json`.

First sign in and link the repository to an Expo project:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Then create the Android tester build:

```bash
npm run build:preview
```

EAS returns a shareable installation URL. Android testers can open that URL, download the APK and install CrowdLens directly on their devices.

## Proof payload

The signed proof includes mission context, capture instruction, capture timestamp, GPS coordinates, GPS accuracy, distance from the mission point and photo dimensions. The image itself remains local in the current MVP.

## Hackathon scope

CrowdLens demonstrates the complete Android verification experience and the Solana signing/approval loop. The visible USDC reward is a test reward. Approval is recorded on Devnet as a transaction receipt.

The following are intentionally not represented as production-complete features:

- shared cloud mission/submission database across different devices
- permanent remote photo/video storage
- real SPL-token USDC escrow and automatic payout
- production anti-spoof guarantees beyond the current GPS/mock-location checks

Those are production infrastructure extensions rather than claims made by this MVP.
