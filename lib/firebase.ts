import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

// ---------------------------------------------------------------------------
// Config — built first, validated second
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// ---------------------------------------------------------------------------
// Validate the config object itself — single source of truth
// ---------------------------------------------------------------------------
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const

const missing = Object.entries(firebaseConfig)
  .filter(([key, value]) => REQUIRED_KEYS.includes(key as typeof REQUIRED_KEYS[number]) && !value)
  .map(([key]) => key)

if (missing.length > 0) {
  throw new Error(
    `Firebase config is incomplete. Missing: ${missing.join(', ')}.\n\n` +
    '  1. Ensure .env.local exists in the project root (next to package.json)\n' +
    '  2. Ensure each variable has no quotes, commas, or trailing spaces\n' +
    '  3. RESTART the dev server — Next.js only reads .env.local at startup\n'
  )
}

// ---------------------------------------------------------------------------
// Single-init guard — safe across Next.js hot reloads
// ---------------------------------------------------------------------------
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const db   = getFirestore(app)
export const auth = getAuth(app)

// Analytics is browser-only — isSupported() returns false in SSR / Node
export const analyticsPromise = isSupported().then((yes) => yes ? getAnalytics(app) : null)
