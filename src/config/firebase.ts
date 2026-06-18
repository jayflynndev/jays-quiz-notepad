import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByxkZc7OeqctufRlKEDwcTCzi4WeoBgV0",
  authDomain: "jaysquiz-a03a2.firebaseapp.com",
  projectId: "jaysquiz-a03a2",
  storageBucket: "jaysquiz-a03a2.firebasestorage.app",
  messagingSenderId: "917643667574",
  appId: "1:917643667574:web:fbb5d4679edc50ac359757",
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
