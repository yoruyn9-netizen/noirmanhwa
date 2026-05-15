
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Developer Authentication Node
 * ONLY WORKS IN DEVELOPMENT ENVIRONMENT.
 */
export const enableDevAutoLogin = async () => {
  // Security lock: only execute in development
  if (process.env.NODE_ENV !== 'development') return;
  
  const auth = getAuth();
  
  // Owner account credentials (dedicated for dev terminal)
  const DEV_OWNER_EMAIL = 'owner@noirmanhwa.dev';
  const DEV_OWNER_PASSWORD = 'devowner123';
  
  try {
    // Attempt automatic identity synchronization
    await signInWithEmailAndPassword(auth, DEV_OWNER_EMAIL, DEV_OWNER_PASSWORD);
    console.log('✅ [DEV MODE] Identity Synced: Supreme Owner authenticated.');
  } catch (error) {
    // Fail silently if account doesn't exist yet
    console.warn('[DEV MODE] Auto-login standby: Owner credentials not localized.');
  }
};

/**
 * Verifies if the target node has owner clearance.
 */
export const checkDevOwnerAccess = async (uid: string) => {
  if (process.env.NODE_ENV !== 'development') return false;
  
  const db = getFirestore();
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  return userSnap.exists() && userSnap.data().role === 'owner';
};
