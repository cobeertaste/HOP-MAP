import { initializeApp } from "firebase/app";
import { initializeAuth, inMemoryPersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import firebaseConfigFile from "../../firebase-applet-config.json";

// Prioritize environment variables (VITE_FIREBASE_*) and fall back to the JSON config file.
const configBase = (firebaseConfigFile || {}) as any;

const derivedProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || configBase.projectId || "hopmap-cobeertaste";
const derivedSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configBase.messagingSenderId || (() => {
  const appIdVal = import.meta.env.VITE_FIREBASE_APP_ID || configBase.appId;
  if (appIdVal && typeof appIdVal === 'string') {
    const parts = appIdVal.split(':');
    if (parts.length > 1) {
      return parts[1];
    }
  }
  return undefined;
})();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configBase.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configBase.authDomain || (derivedProjectId ? `${derivedProjectId}.firebaseapp.com` : undefined),
  projectId: derivedProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configBase.storageBucket || (derivedProjectId ? `${derivedProjectId}.appspot.com` : undefined),
  messagingSenderId: derivedSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configBase.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || configBase.measurementId,
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configBase.firestoreDatabaseId;

// Initialize Firebase with dynamic config from environment variables or local fallback config
export const isFirebaseConfigured = !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "placeholder-api-key-please-configure" && 
  firebaseConfig.apiKey !== "INSERIR_API_KEY_NA_CONSOLA_AI_STUDIO" && 
  !firebaseConfig.apiKey.includes("DUMMYKEYFORLOCALMODE");
const finalConfig = isFirebaseConfigured ? firebaseConfig : {
  apiKey: "AIzaSyDUMMYKEYFORLOCALMODE-MOCKKEY_ABC",
  authDomain: "placeholder-project.firebaseapp.com",
  projectId: "placeholder-project",
  storageBucket: "placeholder-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890abcdef"
};

const app = initializeApp(finalConfig);

let authInstance;
if (isFirebaseConfigured) {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  } catch (e) {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

if (!isFirebaseConfigured) {
  console.warn("Firebase API Key is missing. Please configure your .env file with the appropriate VITE_FIREBASE_* keys, or run the Firebase setup again.");
}

export default app;


