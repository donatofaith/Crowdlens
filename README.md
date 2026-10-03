# CrowdLens

CrowdLens is an Android-first Solana Mobile app for requesting fresh real-world information from people who are physically near a location.

A requester creates a mission such as **“Is this event live right now?”** A nearby scout goes to the location, passes a GPS Proof of Presence check, captures fresh evidence inside the CrowdLens camera, signs the proof with a Solana wallet, and submits it for requester review.

## Core MVP flow

1. Discover a nearby mission.
2. Open the mission and start Proof of Presence.
3. Grant precise Android location permission.
4. CrowdLens checks GPS accuracy, geofence distance and repeated location readings.
5. Capture proof only through the in-app camera; gallery uploads are not part of the verification flow.
6. GPS is checked again at the exact time of capture.
7. Sign the proof payload with Solana Mobile Wallet Adapter.
8. Submit proof to the requester review screen.
9. Requester approves or rejects the proof.
10. Approval creates a Solana Devnet transaction receipt. Reward accounting is simulated for the hackathon demo until token escrow is connected.

## Mobile-specific features

- Native Android app / APK workflow
- Precise foreground GPS permission
- Geofence verification
- Multiple consistent location readings
- Android mock-location flag check
- In-app live camera capture
- No gallery-upload path for verified evidence
- Random capture instruction generated for the mission
- Solana Mobile Wallet Adapter connection
- Wallet-signed proof payload
- Solana Devnet approval transaction receipt

## Stack

- React Native + Expo
- Expo Router
- Expo Location
- Expo Camera
- Solana Kit
- Solana Mobile Wallet Adapter via `@wallet-ui/react-native-kit`
- Solana Devnet
- HeroUI Native / Uniwind

## Run locally

```bash
npm install
npm run android
```

Use an Android development build rather than Expo Go because CrowdLens depends on native Android modules and Mobile Wallet Adapter.

## Emulator demo flow

Open:

**Missions → first mission → Start location check**

On the emulator, grant location permission. After the first location reading, use the development-only button:

**Set mission point to current emulator location**

Wait for three valid readings. When CrowdLens shows **You are on-site**, continue to the live camera.

Allow camera access, capture proof, connect a compatible Solana Mobile wallet, sign the proof, then tap **Submit proof**. On the requester review screen, connect a wallet with a small amount of Devnet SOL for transaction fees and tap **Approve** to write the approval receipt on Solana Devnet.

## Proof payload

The signed proof includes mission context, capture instruction, capture timestamp, GPS coordinates, GPS accuracy, distance from the mission point and photo dimensions. The image itself remains local in the current MVP; production storage and token escrow are intentionally separate follow-up infrastructure.

## Hackathon scope note

CrowdLens currently demonstrates the complete mobile verification UX and Solana signing/approval loop. The reward shown in the UI is a test reward. The approval is recorded on Devnet as a transaction receipt; actual SPL-token escrow and permanent remote media storage are not represented as production-complete features.
