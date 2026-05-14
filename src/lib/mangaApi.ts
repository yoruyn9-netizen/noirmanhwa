
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
    console.log('🔍 Initializing Multi-Source Discovery Protocol...');

    // 1. ASURA NODE (Primary)
    try {
      const asuraData = await fetchAsuraLatest();
      if (asuraData && asuraData.length > 0) {
        console.log('📡 Signal Established: ASURA_NODE');
        if (params.title) {
          const query = params.title.toLowerCase();
          return asuraData.filter(m => m.title.toLowerCase().includes(query));
        }
        return asuraData;
      }
    } catch (e) {
      console.warn('⚠️ Asura Node offline. Relaying to fallback...');
    }

    // 2. FLAME NODE (Secondary)
    try {
      const flameData = await fetchFlameLatest();
      if (flameData && flameData.length > 0) {
        console.log('📡 Signal Established: FLAME_NODE');
        if (params.title) {
          const query = params.title.toLowerCase();
          return flameData.filter(m => m.title.toLowerCase().includes(query));
        }
        return flameData;
      }
    } catch (e) {
      console.warn('⚠️ Flame Node offline. Relaying to fallback...');
    }

    // 3. KOMIKU NODE (Tertiary)
    try {
      const komikuData = await fetchKomikuLatest();
      if (komikuData && komikuData.length > 0) {
        console.log('📡 Signal Established: KOMIKU_NODE');
        return komikuData;
      }
    } catch (e) {
      console.warn('⚠️ Komiku Node offline.');
    }

    // CRITICAL FAILURE: All sources unreachable
    console.error('❌ [CRITICAL]: Total Signal Loss. All primary discovery nodes offline.');
    return [];
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    const list = await this.fetchMangaList({ page: 1 });
    const manga = list.find(m => m.id === id);
    
    if (!manga) {
      console.warn(`[System]: Node ${id} not found in discovery feed.`);
      return null;
    }

    const chapters = await this.fetchChapters(id, source);

    return {
      ...manga,
      chapters
    };
  },

  async fetchChapters(mangaId: string, source: MangaSource): Promise<Chapter[]> {
    try {
      if (source === 'asura') {
        return await fetchAsuraChapters(mangaId);
      }
      // Future expansion for other source chapter lists
    } catch (e) {
      console.error(`❌ Chapter Sync Failed for source: ${source}`, e);
    }
    return [];
  },

  async getTags() {
    // Sources handle genres via internal attributes; returning empty list for discovery component
    return { data: [] }; 
  },

  async search(query: string, source: string = 'asura', genres: string[] = []) {
    return this.fetchMangaList({ page: 1, title: query });
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.slice(0, 15);
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.filter(m => m.id !== currentId).slice(0, 8);
  }
};
