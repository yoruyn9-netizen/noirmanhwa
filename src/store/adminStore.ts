
import { create } from 'zustand';
import { 
  setUserBanStatus, 
  setUserPremiumStatus, 
  setUserRole,
  deleteChatMessage 
} from '@/lib/adminUtils';

interface AdminState {
  isProcessing: boolean;
  error: string | null;
  banUser: (userId: string, currentStatus: boolean) => Promise<void>;
  setPremium: (userId: string, currentStatus: boolean) => Promise<void>;
  updateRole: (userId: string, role: any) => Promise<void>;
  removeMessage: (messageId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isProcessing: false,
  error: null,

  banUser: async (userId, currentStatus) => {
    set({ isProcessing: true, error: null });
    try {
      await setUserBanStatus(userId, !currentStatus);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isProcessing: false });
    }
  },

  setPremium: async (userId, currentStatus) => {
    set({ isProcessing: true, error: null });
    try {
      await setUserPremiumStatus(userId, !currentStatus);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isProcessing: false });
    }
  },

  updateRole: async (userId, role) => {
    set({ isProcessing: true, error: null });
    try {
      await setUserRole(userId, role);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isProcessing: false });
    }
  },

  removeMessage: async (messageId) => {
    set({ isProcessing: true, error: null });
    try {
      await deleteChatMessage(messageId);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isProcessing: false });
    }
  },
}));
