
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'owner' | 'admin' | 'user';

export interface ReadingHistoryItem {
  mangaId: string;
  title: string;
  cover?: string;
  lastChapter: string;
  progress: number; // 0 to 100
  lastRead: any; // Firestore Timestamp
}

export interface UserStats {
  totalMangaRead: number;
  totalChaptersRead: number;
  favoriteGenre: string;
  totalReadingTime: number; // in hours
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bannerURL: string | null;
  bio?: string;
  role: UserRole;
  isPremium?: boolean;
  isBanned?: boolean;
  equippedBorder?: string | null;
  ownedBorders?: string[]; // List of unlocked border IDs
  updatedAt?: string;
  joinedAt?: any; // Firestore Timestamp
  lastActive?: any; // Firestore Timestamp
  readingHistory?: ReadingHistoryItem[];
  stats?: UserStats;
}
