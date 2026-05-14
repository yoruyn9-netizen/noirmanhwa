import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContentType = 'all' | 'manhwa' | 'manga' | 'manhua' | 'sub-indo';
export type SortOrder = 'latest' | 'popular' | 'rating' | 'alphabetical' | 'newly-added';
export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

interface FilterState {
  contentType: ContentType;
  sortBy: SortOrder;
  status: MangaStatus[];
  selectedGenres: string[];
  contentRating: string[];
  isFilterOpen: boolean;
  
  setContentType: (type: ContentType) => void;
  setSortBy: (sort: SortOrder) => void;
  toggleStatus: (status: MangaStatus) => void;
  toggleGenre: (genreId: string) => void;
  toggleContentRating: (rating: string) => void;
  toggleFilterPanel: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      contentType: 'all',
      sortBy: 'latest',
      status: [],
      selectedGenres: [],
      contentRating: ['safe', 'suggestive'],
      isFilterOpen: false,

      setContentType: (type) => set({ contentType: type }),
      setSortBy: (sort) => set({ sortBy: sort }),
      
      toggleStatus: (status) => set((state) => ({
        status: state.status.includes(status)
          ? state.status.filter((s) => s !== status)
          : [...state.status, status]
      })),

      toggleGenre: (genreId) => set((state) => ({
        selectedGenres: state.selectedGenres.includes(genreId)
          ? state.selectedGenres.filter((g) => g !== genreId)
          : [...state.selectedGenres, genreId]
      })),

      toggleContentRating: (rating) => set((state) => ({
        contentRating: state.contentRating.includes(rating)
          ? state.contentRating.filter((r) => r !== rating)
          : [...state.contentRating, rating]
      })),

      toggleFilterPanel: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

      resetFilters: () => set({
        status: [],
        selectedGenres: [],
        contentRating: ['safe', 'suggestive'],
        sortBy: 'latest'
      }),
    }),
    {
      name: 'noir-manhwa-filters',
      partialize: (state) => ({ 
        contentType: state.contentType, 
        sortBy: state.sortBy,
        status: state.status,
        selectedGenres: state.selectedGenres,
        contentRating: state.contentRating
      }),
    }
  )
);
