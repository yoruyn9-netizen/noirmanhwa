export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'user' | 'premium' | 'admin' | 'owner';
    isBanned: boolean;
    equippedBorder?: string;
    permissions?: string[];
    premiumExpiry?: Date;
    premiumNote?: string;
    loginStreak?: number;
    lastLoginDate?: Date;
    totalLoginDays?: number;
    currentTitle?: string;
    badges?: string[];
    lastClaimDate?: Date;
  }
  