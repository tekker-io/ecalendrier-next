import {
  getAnalytics,
  initializeAnalytics,
  logEvent,
} from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import {
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadString,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function initFirebase() {
  try {
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      initializeAnalytics(app);
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

export async function getMediaURL(filename: string) {
  initFirebase();
  const storage = getStorage();
  return (await getDownloadURL(ref(storage, filename))) + '?alt=media';
}

export async function getFile(filename: string) {
  initFirebase();
  const storage = getStorage();
  const url = await getDownloadURL(ref(storage, filename));
  const data = await fetch(url);
  return await data.text();
}

export async function writeFileBytes(filename: string, content: Blob) {
  initFirebase();
  const storage = getStorage();
  const fileRef = ref(storage, filename);
  await uploadBytes(fileRef, content);
}

export async function writeFile(filename: string, content: string) {
  initFirebase();
  const storage = getStorage();
  const fileRef = ref(storage, filename);
  await uploadString(fileRef, content);
}

export async function deleteFile(filename: string) {
  initFirebase();
  const storage = getStorage();
  const fileRef = ref(storage, filename);
  await deleteObject(fileRef);
}

export function getFirebaseFirestore() {
  initFirebase();
  return getFirestore();
}

export function sendEvent(name: string, params?: { [key: string]: string }) {
  initFirebase();
  const analytics = getAnalytics();
  logEvent(analytics, name, params);
}

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  // return result so caller can obtain user and idToken
  const idToken = await result.user.getIdToken();
  return { result, idToken };
}

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

function readStoredEmail() {
  try {
    return window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
  } catch {
    return null;
  }
}

function writeStoredEmail(email: string | null) {
  try {
    if (email) {
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
    } else {
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    }
  } catch {
    // ignore (private browsing, blocked storage...)
  }
}

export async function sendMagicLink(email: string) {
  const auth = getFirebaseAuth();
  auth.languageCode = 'fr';
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/login/verify`,
    handleCodeInApp: true,
  });
  // Remember the email so the user doesn't have to type it again when
  // opening the link on the same device
  writeStoredEmail(email);
}

export function isMagicLink(url: string) {
  return isSignInWithEmailLink(getFirebaseAuth(), url);
}

export function getEmailForMagicLink() {
  return readStoredEmail();
}

export async function signInWithMagicLink(email: string, url: string) {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailLink(auth, email, url);
  writeStoredEmail(null);
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
