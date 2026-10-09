# CrowdLens shared backend setup

This is **foundation code**, not an already running backend. CrowdLens continues to use the existing local mission and browser-demo flows until the backend is configured and connected.

## 1. Create a Supabase project

Create a project in Supabase and apply `supabase/migrations/20261009_000001_crowdlens_shared.sql` in its SQL Editor. Do not run it against an unrelated existing database without reviewing the schema and policies.

The migration adds:
- `crowdlens_missions`: requester-owned missions, readable only by authenticated users
- `crowdlens_submissions`: scout evidence only visible to that scout or the mission requester
- `crowdlens_review_submission`: only the matching mission requester may mark a demo review decision
- `crowdlens-proofs`: private JPEG bucket, with path-based scout ownership and requester read permissions

There are **no public submission/photo policies**, no real token transfers and no server-backed claim that browser location is trustworthy.

## 2. Configure authentication

In Supabase Auth, enable email sign-in with one-time codes. If sending email codes instead of magic links, configure the email template to include `{{ .Token }}`. Configure appropriate site URLs and authorized redirect URLs for your web hostname. Never ask users for wallet recovery phrases.

## 3. Configure Expo/Vercel

Set the following in your **Vercel project environment variables** (Production and Preview as needed), then redeploy the website:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Use only the **publishable/anon** browser key. Do not put a `service_role`, `sb_secret`, database password, signing secret, or private wallet key in any `EXPO_PUBLIC_` variable or GitHub file. The Supabase URL and publishable key are public identifiers; access controls come from Auth + RLS.

The shared client is in `src/features/cloud/crowdlens-cloud.ts`, intentionally free of React Native/browser-only dependencies. It provides email-code authentication, mission listing/creation, submission listing, private photo upload, submission creation, and an authenticated review RPC.

## 4. Verify security before enabling real uploads

Use **two different test user accounts**:
1. User A creates a mission.
2. User B can read it and create a `browser_unverified` submission with a photo in their private folder.
3. B can read only submissions they created.
4. A can read submissions for their missions and access relevant private proof images.
5. A can accept/reject B's submission through `crowdlens_review_submission`.
6. A cannot create a submission pretending to be B. B cannot review A's mission.
7. Anonymous users cannot read missions, submissions, or storage objects.
8. Neither person can view unrelated private photos.

Additional work is required before a production deployment: authenticated UI wiring, token refresh/session handling, privacy/retention choices, Android cloud adapter, upload limits/rate controls, secure proof validation, and end-to-end device testing.

## Important limitations

Supabase Auth is a separate user identity from Phantom or Solana Mobile Wallet Adapter. Connecting a wallet **does not authenticate to Supabase**. Wallet-to-account binding requires a server-issued nonce and verified signature; never trust a wallet address supplied by the browser alone.

The database captures *browser-reported* coordinates, not verified presence. Demo acceptance is a database status, not a Solana transaction, escrow settlement or USDC payout.
