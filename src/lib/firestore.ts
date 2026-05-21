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
import { UserProfile } from '@/types/user';
import { ChatMessage } from '@/types/chat';
import { Report } from '@/types/report';
import { Border } from '@/types/border';

const { db } = initializeFirebase();

export { db };

// ... (user, chat, notification functions remain the same)

/**
 * USERS MANAGEMENT
 */
export const syncUserToFirestore = async (user: any) => {
  if (!user?.uid) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    const isOwner = user.role === 'owner';
    const ownedBorders = isOwner ? ['ink-master', 'cyber-core', 'celestial-dream', 'stellar-compass'] : [];

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      bannerURL: null,
      role: user.role || 'user',
      isPremium: user.isPremium || false,
      isBanned: false,
      equippedBorder: null, // Start with no border
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
 * BORDER SYSTEM
 */
export const getBorders = async (): Promise<Border[]> => {
    const bordersRef = collection(db, 'borders');
    const q = query(bordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Border));
};

export const equipBorder = async (userId: string, borderId: string | null) => {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { equippedBorder: borderId });
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
