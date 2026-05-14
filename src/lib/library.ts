
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { db } = initializeFirebase();

export async function toggleLibrary(userId: string, manga: any, status: 'reading' | 'completed' | 'plan') {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const library = userSnap.data().library || [];
  const exists = library.find((item: any) => item.mangaId === manga.id);

  if (exists) {
    await updateDoc(userRef, {
      library: arrayRemove(exists)
    });
    return false;
  } else {
    await updateDoc(userRef, {
      library: arrayUnion({
        mangaId: manga.id,
        title: manga.title,
        cover: manga.cover,
        status,
        addedAt: new Date().toISOString()
      })
    });
    return true;
  }
}

export async function updateReadingHistory(userId: string, mangaId: string, chapterId: string, chapterNum: string) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const history = userSnap.data().readingHistory || [];
  const filtered = history.filter((h: any) => h.mangaId !== mangaId);
  
  const newEntry = {
    mangaId,
    chapterId,
    chapterNum,
    lastRead: new Date().toISOString()
  };

  await updateDoc(userRef, {
    readingHistory: [newEntry, ...filtered].slice(0, 20)
  });
}
