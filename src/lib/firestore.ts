
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { UserProfile } from '@/types/user';
import { ChatMessage } from '@/types/chat';
import { Report } from '@/types/report';

const { db } = initializeFirebase();

/**
 * USERS MANAGEMENT
 */
export const syncUserToFirestore = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role || 'user',
      isPremium: false,
      isBanned: false,
      updatedAt: new Date().toISOString()
    });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  updateDoc(userRef, { ...data, updatedAt: new Date().toISOString() });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => ({ ...doc.data() } as UserProfile));
};

/**
 * CHAT SYSTEM
 */
export const sendChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const chatRef = collection(db, 'chat_messages');
  addDoc(chatRef, {
    ...msg,
    timestamp: serverTimestamp()
  });
};

export const subscribeToChat = (callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chat_messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  );
  
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    callback(messages);
  });
};

/**
 * REPORTS SYSTEM
 */
export const submitReport = async (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => {
  const reportRef = collection(db, 'reports');
  addDoc(reportRef, {
    ...report,
    status: 'pending',
    timestamp: serverTimestamp()
  });
};

export const subscribeToReports = (callback: (reports: Report[]) => void) => {
  const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const reports = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Report));
    callback(reports);
  });
};

export const resolveReport = async (reportId: string) => {
  const reportRef = doc(db, 'reports', reportId);
  updateDoc(reportRef, { status: 'resolved' });
};
