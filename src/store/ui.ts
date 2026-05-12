import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PanelType = 'none' | 'search' | 'bookmark' | 'genre' | 'profile';

interface ReaderSettings {
  direction: 'vertical' | 'rtl' | 'ltr';
  fitMode: 'fit' | 'original' | 'stretch';
  autoScroll: boolean;
}

interface UIState {
  activePanel: PanelType;
  isOpen: boolean;
  readerSettings: ReaderSettings;
  bookmarks: any[];
  readingHistory: any[];
  openPanel: (name: PanelType) => void;
  closePanel: () => void;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
  addBookmark: (manga: any) => void;
  removeBookmark: (mangaId: string) => void;
  addToHistory: (entry: any) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePanel: 'none',
      isOpen: false,
      readerSettings: {
        direction: 'vertical',
        fitMode: 'fit',
        autoScroll: false,
      },
      bookmarks: [],
      readingHistory: [],
      openPanel: (name) => set({ activePanel: name, isOpen: true }),
      closePanel: () => set({ isOpen: false, activePanel: 'none' }),
      updateReaderSettings: (settings) =>
        set((state) => ({ readerSettings: { ...state.readerSettings, ...settings } })),
      addBookmark: (manga) =>
        set((state) => ({
          bookmarks: [manga, ...state.bookmarks.filter((b) => b.id !== manga.id)].slice(0, 50),
        })),
      removeBookmark: (mangaId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== mangaId),
        })),
      addToHistory: (entry) =>
        set((state) => ({
          readingHistory: [entry, ...state.readingHistory.filter((h) => h.mangaId !== entry.mangaId)].slice(0, 50),
        })),
    }),
    {
      name: 'noir-manhwa-storage',
    }
  )
);