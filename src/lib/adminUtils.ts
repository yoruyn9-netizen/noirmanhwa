
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { UserRole } from '@/types/user';

const { db } = initializeFirebase();

export async function setUserBanStatus(userId: string, isBanned: boolean) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isBanned });
}

export async function setUserPremiumStatus(userId: string, isPremium: boolean) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isPremium });
}

export async function setUserRole(userId: string, role: UserRole) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
}

export async function deleteChatMessage(messageId: string) {
  const messageRef = doc(db, 'chat_messages', messageId);
  await deleteDoc(messageRef);
}
