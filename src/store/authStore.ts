
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { syncUserToFirestore, getUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  updateUserInStore: (data: Partial<UserProfile>) => void;
}

const ADMIN_EMAIL = "jullyan382@gmail.com";
const ADMIN_PASS = "YAN123";

// System-wide unlocked borders for the owner signature
const ALL_BORDERS = ['ink-master', 'cyber-core', 'celestial-dream', 'stellar-compass', 'bronze-glow', 'silver-shimmer', 'gold-admin', 'legend-owner'];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      updateUserInStore: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),

      checkAuth: () => {
        const { auth } = initializeFirebase();
        set({ isLoading: true });
        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const profile = await getUserProfile(fbUser.uid);
            
            if (profile?.isBanned) {
              await signOut(auth);
              set({ user: null, error: "ACCESS DENIED: Banned.", isLoading: false });
              return;
            }

            const isOwner = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            const userData: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: profile?.displayName || fbUser.displayName,
              photoURL: profile?.photoURL || fbUser.photoURL,
              bannerURL: profile?.bannerURL || null,
              bio: profile?.bio || "",
              role: isOwner ? 'owner' : (profile?.role || 'user'),
              isPremium: profile?.isPremium || isOwner || false,
              isBanned: false,
              equippedBorder: profile?.equippedBorder || 'none',
              ownedBorders: isOwner ? ALL_BORDERS : (profile?.ownedBorders || [])
            };

            set({ user: userData, isLoading: false });
            syncUserToFirestore(userData);
          } else {
            set({ user: null, isLoading: false });
          }
        });
      },

      loginWithGoogle: async () => {
        const { auth } = initializeFirebase();
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          
          const profile = await getUserProfile(result.user.uid);
          if (profile?.isBanned) {
            await signOut(auth);
            throw new Error("ACCESS DENIED: Banned.");
          }

          const isOwner = result.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const userData: UserProfile = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: profile?.displayName || result.user.displayName,
            photoURL: profile?.photoURL || result.user.photoURL,
            bannerURL: profile?.bannerURL || null,
            role: isOwner ? 'owner' : (profile?.role || 'user'),
            isPremium: profile?.isPremium || isOwner || false,
            isBanned: false,
            equippedBorder: profile?.equippedBorder || 'none',
            ownedBorders: isOwner ? ALL_BORDERS : (profile?.ownedBorders || [])
          };

          set({ user: userData, isLoading: false });
          syncUserToFirestore(userData);
        } catch (err: any) {
          set({ error: err.message || 'Login failed.', isLoading: false });
        }
      },

      loginAsAdmin: async (email, password) => {
        const { auth } = initializeFirebase();
        set({ isLoading: true, error: null });
        
        const normalizedEmail = email.toLowerCase().trim();
        try {
          if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
            const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            const profile = await getUserProfile(result.user.uid);
            
            const userData: UserProfile = {
              uid: result.user.uid,
              email: result.user.email,
              displayName: profile?.displayName || "Supreme Administrator",
              photoURL: profile?.photoURL || null,
              bannerURL: profile?.bannerURL || null,
              role: 'owner',
              isPremium: true,
              isBanned: false,
              equippedBorder: profile?.equippedBorder || 'none',
              ownedBorders: ALL_BORDERS
            };
            set({ user: userData, isLoading: false });
            syncUserToFirestore(userData);
          } else {
            const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            const profile = await getUserProfile(result.user.uid);
            
            if (profile?.isBanned) {
              await signOut(auth);
              throw new Error("ACCESS DENIED: Banned.");
            }

            set({
              user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: profile?.displayName || result.user.displayName || "User",
                photoURL: profile?.photoURL || result.user.photoURL,
                bannerURL: profile?.bannerURL || null,
                role: profile?.role || 'user',
                isPremium: profile?.isPremium || false,
                isBanned: false,
                equippedBorder: profile?.equippedBorder || 'none',
                ownedBorders: profile?.ownedBorders || []
              },
              isLoading: false,
            });
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      logout: async () => {
        const { auth } = initializeFirebase();
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: 'noirmanhwa-auth-v3',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
