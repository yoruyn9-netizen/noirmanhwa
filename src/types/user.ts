
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  role: 'user' | 'owner';
  isPremium?: boolean;
  isBanned?: boolean;
  updatedAt?: string;
}
