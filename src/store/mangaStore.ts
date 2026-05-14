
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MangaSource, Manga } from '@/types/manga';

interface MangaState {
  preferredSource: MangaSource | 'all';
  readingHistory: string[];
  recommendations: Manga[];
  isLoading: boolean;
  setPreferredSource: (source: MangaSource | 'all') => void;
  addToHistory: (mangaId: string) => void;
  setRecommendations: (mangas: Manga[]) => void;
}

export const useMangaStore = create<MangaState>()(
  persist(
    (set) => ({
      preferredSource: 'all',
      readingHistory: [],
      recommendations: [],
      isLoading: false,
      setPreferredSource: (source) => set({ preferredSource: source }),
      addToHistory: (id) => set((state) => ({ 
        readingHistory: [id, ...state.readingHistory.filter(h => h !== id)].slice(0, 50) 
      })),
      setRecommendations: (mangas) => set({ recommendations: mangas }),
    }),
    {
      name: 'noir_manga_preferences',
      partialize: (state) => ({ preferredSource: state.preferredSource, readingHistory: state.readingHistory }),
    }
  )
);
