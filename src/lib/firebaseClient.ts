import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import {
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function initFirebase() {
  try {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
      const auth = getAuth();
      auth.onIdTokenChanged(async (user) => {
        if (user) {
          const idToken = await user.getIdToken();
          await createServerSession(idToken);
        }
      });
    }
  } catch (err) {
    // ignore initialization errors in dev when env vars missing
    // caller can still attempt to use auth and handle nulls
    console.warn('Firebase initialization warning:', err);
  }
}

export function getFirebaseAuth() {
  initFirebase();
  return getAuth();
}

export async function getFile(filename: string) {
  initFirebase();
  const storage = getStorage();
  const url = await getDownloadURL(ref(storage, filename));
  const data = await fetch(url);
  return await data.text();
}

export async function writeFile(filename: string, content: string) {
  initFirebase();
  const storage = getStorage();
  const fileRef = ref(storage, filename);
  await uploadString(fileRef, content);
}

export function getFirebaseFirestore() {
  initFirebase();
  return getFirestore();
}

export function sendEvent(name: string) {
  initFirebase();
  const analytics = getAnalytics();
  logEvent(analytics, name);
}

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  // return result so caller can obtain user and idToken
  const idToken = await result.user.getIdToken();
  return { result, idToken };
}

export async function signOut() {
  const auth = getFirebaseAuth();
  return firebaseSignOut(auth);
}

export async function createServerSession(idToken: string) {
  // Call server endpoint to exchange ID token for a secure session cookie
  return fetch('/api/session/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
}

export async function clearServerSession() {
  return fetch('/api/session/logout', { method: 'POST' });
}
