// Firebase initialization (Authentication + Firestore).
//
// IMPORTANT:
// - Do not hardcode real secrets in source control.
// - In Vite, environment variables must be prefixed with `VITE_`.
// - Create a `.env.local` file with the values shown below.
//
// Example `.env.local`:
//   VITE_FIREBASE_API_KEY="YOUR_API_KEY"
//   VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT.firebaseapp.com"
//   VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
//   VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT.appspot.com"
//   VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
//   VITE_FIREBASE_APP_ID="YOUR_APP_ID"

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase once for the entire app.
const app = initializeApp(firebaseConfig)

// Export initialized service instances for use throughout the app.
export const auth = getAuth(app)
export const db = getFirestore(app)
