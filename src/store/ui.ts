
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PanelType = 'none' | 'search' | 'bookmark' | 'genre' | 'profile' | 'readerSettings' | 'editProfile' | 'appSettings';

interface ReaderSettings {
  direction: 'vertical' | 'rtl' | 'ltr';
  fitMode: 'fit' | 'original' | 'stretch';
  autoScroll: boolean;
  autoScrollSpeed: number;
  theme: 'dark' | 'sepia' | 'light';
}

interface AppSettings {
  notifications: boolean;
  highQualityImages: boolean;
  incognitoMode: boolean;
  autoUpdateLibrary: boolean;
}

interface UIState {
  activePanel: PanelType;
  isOpen: boolean;
  isGlobalUIVisible: boolean;
  isWelcomePhase: boolean;
  readerSettings: ReaderSettings;
  appSettings: AppSettings;
  bookmarks: any[];
  readingHistory: any[];
  activeGenreId: string | null;
  openPanel: (name: PanelType) => void;
  closePanel: () => void;
  setGlobalUIVisible: (visible: boolean) => void;
  setWelcomePhase: (active: boolean) => void;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  addBookmark: (manga: any) => void;
  removeBookmark: (mangaId: string) => void;
  addToHistory: (entry: any) => void;
  setActiveGenreId: (id: string | null) => void;
  clearCache: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePanel: 'none',
      isOpen: false,
      isGlobalUIVisible: true,
      isWelcomePhase: false,
      readerSettings: {
        direction: 'vertical',
        fitMode: 'fit',
        autoScroll: false,
        autoScrollSpeed: 1,
        theme: 'dark',
      },
      appSettings: {
        notifications: true,
        highQualityImages: false,
        incognitoMode: false,
        autoUpdateLibrary: true,
      },
      bookmarks: [],
      readingHistory: [],
      activeGenreId: null,
      openPanel: (name) => set({ activePanel: name, isOpen: true }),
      closePanel: () => set({ isOpen: false, activePanel: 'none' }),
      setGlobalUIVisible: (visible) => set({ isGlobalUIVisible: visible }),
      setWelcomePhase: (active) => set({ isWelcomePhase: active }),
      updateReaderSettings: (settings) =>
        set((state) => ({ readerSettings: { ...state.readerSettings, ...settings } })),
      updateAppSettings: (settings) =>
        set((state) => ({ appSettings: { ...state.appSettings, ...settings } })),
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
      setActiveGenreId: (id) => set({ activeGenreId: id }),
      clearCache: () => set({ bookmarks: [], readingHistory: [] }),
    }),
    {
      name: 'noir-manhwa-storage-v3',
      partialize: (state) => ({
        readerSettings: state.readerSettings,
        appSettings: state.appSettings,
        bookmarks: state.bookmarks,
        readingHistory: state.readingHistory,
      }),
    }
  )
);
