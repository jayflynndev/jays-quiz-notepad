import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyByxkZc7OeqctufRlKEDwcTCzi4WeoBgV0",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "jaysquiz-a03a2.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "jaysquiz-a03a2",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "jaysquiz-a03a2.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "917643667574",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:917643667574:web:fbb5d4679edc50ac359757",
};

function hasFirebaseConfig() {
  return (
    firebaseConfig.apiKey.length > 0 &&
    firebaseConfig.authDomain.length > 0 &&
    firebaseConfig.projectId.length > 0 &&
    firebaseConfig.appId.length > 0
  );
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    console.warn("[Firebase] Initialised: false. Firebase config is incomplete.");
    return null;
  }

  if (firebaseApp !== null) {
    return firebaseApp;
  }

  firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
  console.info("[Firebase] Initialised: true");

  return firebaseApp;
}

export function getFirebaseDb() {
  if (firestoreDb !== null) {
    return firestoreDb;
  }

  const app = getFirebaseApp();

  if (app === null) {
    return null;
  }

  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
  console.info("[Firebase] Firestore initialised: true");

  return firestoreDb;
}
