# TimeTasker Backend Setup

## 1. Prerequisites

- Node.js 20+
- Python 3.11+
- Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

## 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore** (Native mode) under Build > Firestore Database.
3. Enable **Authentication** under Build > Authentication > Sign-in method (add Google and/or Email/Password).
4. Go to Project Settings > Your Apps > Web App and copy the config values into `.env.local`.

## 3. Local Development

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
npm run dev
```

## 4. Deploy Firestore Rules and Indexes

```bash
npm run deploy:rules
```

This deploys both `firestore.rules` and `firestore.indexes.json` (the compound leaderboard indexes).

## 5. Deploy Cloud Functions

```bash
cd functions
pip install -r requirements.txt
cd ..
npm run deploy:functions
```

After deploy, copy the function base URL from Firebase Console > Functions and set it in `.env.local`:

```
NEXT_PUBLIC_CLOUD_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net
```

To deploy everything at once:

```bash
npm run deploy:all
```

## 6. Running the ESP32 Bridge Locally

The WebSocket bridge is a standalone Python process — not a Cloud Function.

```bash
cd functions
ESP32_DEVICE_SECRET=your-secret python -m services.esp32_bridge
```

The bridge listens on `0.0.0.0:8765` by default. Set `NEXT_PUBLIC_ESP32_BRIDGE_URL` in `.env.local` to point to it:

```
NEXT_PUBLIC_ESP32_BRIDGE_URL=ws://localhost:8765
```

For production, run the bridge on a server with a stable IP or hostname and update the URL accordingly.

## 7. Environment Variables Reference

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (e.g. `your-project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID (optional) |
| `NEXT_PUBLIC_CLOUD_FUNCTIONS_URL` | Base URL of deployed Cloud Functions (no trailing slash) |
| `NEXT_PUBLIC_ESP32_BRIDGE_URL` | WebSocket URL of the ESP32 bridge server |
| `NEXT_PUBLIC_ESP32_SECRET` | Shared secret sent by the frontend to authenticate with the bridge — must match `ESP32_DEVICE_SECRET` on the server |
