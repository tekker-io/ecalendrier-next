import admin, { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

const serviceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

if (!admin.apps.length) {
  if (!serviceAccount) {
    console.warn(
      'Firebase Admin service account not configured. Server session routes will fail.'
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
}

// Helper to check the session cookie
export async function checkIsLoggedIn() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  return sessionCookie !== undefined && sessionCookie !== '';
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) throw new Error('No session cookie');
  try {
    return await admin.auth().verifySessionCookie(sessionCookie);
  } catch {
    throw new Error('Invalid session cookie');
  }
}

export default admin;
