
/**
 * @fileOverview Unified API Layer - PURIFIED VERSION
 * Strictly Asura, Flame, and Komiku only. No dummy data.
 */

import { fetchAsuraLatest, fetchAsuraChapters } from './asuraApi';
import { fetchFlameLatest } from './flameApi';
import { fetchKomikuLatest } from './komikuApi';
import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';

export const mangaApi = {
  /**
   * Universal List Fetcher with cascading fallback
   */
  async fetchMangaList(params: {
    page: number;
    type?: string;
    sortBy?: string;
    title?: string;
  }): Promise<Manga[]> {
    console.log('🔍 Initializing Multi-Source Discovery...');

    // 1. ASURA NODE (Primary)
    try {
      const asuraData = await fetchAsuraLatest();
      if (asuraData.length > 0) {
        if (params.title) {
          const query = params.title.toLowerCase();
          return asuraData.filter(m => m.title.toLowerCase().includes(query));
        }
        return asuraData;
      }
    } catch (e) {
      console.warn('⚠️ Asura Node bypassed.');
    }

    // 2. FLAME NODE (Secondary)
    try {
      const flameData = await fetchFlameLatest();
      if (flameData.length > 0) return flameData;
    } catch (e) {
      console.warn('⚠️ Flame Node bypassed.');
    }

    // 3. KOMIKU NODE (Tertiary)
    try {
      const komikuData = await fetchKomikuLatest();
      if (komikuData.length > 0) return komikuData;
    } catch (e) {
      console.warn('⚠️ Komiku Node bypassed.');
    }

    // CRITICAL FAILURE: All sources unreachable
    console.error('❌ [CRITICAL]: Total Signal Loss. All sources offline.');
    return [];
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    // Current implementation uses list data for details for performance
    const list = await this.fetchMangaList({ page: 1 });
    const manga = list.find(m => m.id === id);
    
    if (!manga) return null;

    const chapters = await this.fetchChapters(id, source);

    return {
      ...manga,
      chapters
    };
  },

  async fetchChapters(mangaId: string, source: MangaSource): Promise<Chapter[]> {
    if (source === 'asura') {
      return fetchAsuraChapters(mangaId);
    }
    // Add other source chapter fetchers here
    return [];
  },

  async getTags() {
    return { data: [] }; // Categories currently being mapped from live series
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.slice(0, 10);
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.filter(m => m.id !== currentId).slice(0, 8);
  }
};
