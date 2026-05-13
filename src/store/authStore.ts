
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'owner';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

// ⚠️ HARDCODED ADMIN - HAPUS SEBELUM PRODUCTION
const ADMIN_EMAIL = "jullyan382@gmail.com";
const ADMIN_PASS = "Yan123";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const { auth } = initializeFirebase();
        set({ isLoading: true });
        onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            const isOwner = fbUser.email === ADMIN_EMAIL;
            set({
              user: {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                role: isOwner ? 'owner' : 'user',
              },
              isLoading: false,
            });
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
          const isOwner = result.user.email === ADMIN_EMAIL;
          
          set({
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role: isOwner ? 'owner' : 'user',
            },
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          setTimeout(() => get().clearError(), 5000);
        }
      },

      loginAsAdmin: async (email, password) => {
        const { auth } = initializeFirebase();
        set({ isLoading: true, error: null });
        
        try {
          // Hardcoded bypass logic
          if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            const result = await signInWithEmailAndPassword(auth, email, password);
            set({
              user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: "Supreme Administrator",
                photoURL: null,
                role: 'owner',
              },
              isLoading: false,
            });
          } else {
            // Standard login for other users if they use email/pass
            const result = await signInWithEmailAndPassword(auth, email, password);
            set({
              user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName || "User",
                photoURL: result.user.photoURL,
                role: 'user',
              },
              isLoading: false,
            });
          }
        } catch (err: any) {
          set({ error: "Invalid credentials or system rejection.", isLoading: false });
          setTimeout(() => get().clearError(), 5000);
        }
      },

      logout: async () => {
        const { auth } = initializeFirebase();
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: 'noirmanhwa-auth-v1',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
