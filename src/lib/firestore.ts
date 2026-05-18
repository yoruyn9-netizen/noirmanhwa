
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
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { UserProfile, ReadingHistoryItem } from '@/types/user';
import { ChatMessage } from '@/types/chat';
import { Report } from '@/types/report';

const { db } = initializeFirebase();

export { db };

/**
 * USERS MANAGEMENT
 */
export const syncUserToFirestore = async (user: any) => {
  if (!user?.uid) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    // Determine if user is owner
    const isOwner = user.role === 'owner';
    
    // For owners, grant all borders; for regular users, start with empty array
    const ownedBorders = isOwner 
      ? ['ink-master', 'cyber-core', 'celestial-dream', 'stellar-compass']
      : [];

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      bannerURL: null,
      role: user.role || 'user',
      isPremium: user.isPremium || false,
      isBanned: false,
      equippedBorder: 'none',
      ownedBorders: ownedBorders,
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
  await addDoc(chatRef, {
    ...msg,
    timestamp: serverTimestamp()
  });
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
 * NOTIFICATION SYSTEM
 */
export const sendNotification = async (title: string, message: string) => {
  const notifRef = collection(db, 'notifications');
  await addDoc(notifRef, {
    title,
    message,
    timestamp: serverTimestamp(),
    active: true
  });
};

export const subscribeToNotifications = (callback: (notifs: any[]) => void) => {
  const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

/**
 * BORDER SYSTEM
 */
export const addCustomBorder = async (name: string, imageUrl: string, tier: string, ownerId: string) => {
  const borderRef = collection(db, 'custom_borders');
  await addDoc(borderRef, { name, imageUrl, tier, createdBy: ownerId, timestamp: serverTimestamp() });
};

export const subscribeToCustomBorders = (callback: (borders: any[]) => void) => {
  return onSnapshot(collection(db, 'custom_borders'), (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
  });
};

export const resolveReport = async (reportId: string) => {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, { status: 'resolved' });
};
