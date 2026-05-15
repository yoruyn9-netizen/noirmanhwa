
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
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { UserProfile, ReadingHistoryItem } from '@/types/user';
import { ChatMessage } from '@/types/chat';
import { Report } from '@/types/report';

const { db } = initializeFirebase();

/**
 * USERS MANAGEMENT
 */
export const syncUserToFirestore = async (user: any) => {
  if (!user?.uid) return;
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
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      updatedAt: new Date().toISOString(),
      bio: "",
      readingHistory: [],
      stats: {
        totalMangaRead: 0,
        totalChaptersRead: 0,
        favoriteGenre: "None",
        totalReadingTime: 0
      }
    });
  } else {
    await updateDoc(userRef, { lastActive: serverTimestamp() });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: new Date().toISOString() });
};

export const syncHistoryToFirestore = async (uid: string, item: ReadingHistoryItem) => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const currentHistory = (snap.data().readingHistory || []) as ReadingHistoryItem[];
  // Remove existing entry for this manga if it exists
  const filtered = currentHistory.filter(h => h.mangaId !== item.mangaId);
  
  await updateDoc(userRef, {
    readingHistory: [item, ...filtered].slice(0, 20),
    "stats.totalChaptersRead": (snap.data().stats?.totalChaptersRead || 0) + 1
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

/**
 * CHAT SYSTEM
 */
export const sendChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const chatRef = collection(db, 'chat_messages');
  const payload = {
    ...msg,
    replyTo: msg.replyTo || null,
    replyToUser: msg.replyToUser || null,
    mangaMention: msg.mangaMention || null,
    timestamp: serverTimestamp()
  };
  await addDoc(chatRef, payload);
};

export const subscribeToChat = (callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chat_messages'),
    orderBy('timestamp', 'desc'),
    limit(100)
  );
  
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse();
    callback(messages);
  });
};

/**
 * REPORTS SYSTEM
 */
export const submitReport = async (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => {
  const reportRef = collection(db, 'reports');
  await addDoc(reportRef, {
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
  await updateDoc(reportRef, { status: 'resolved' });
};
