
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
    const asuraData = await fetchAsuraLatest();
    if (asuraData && asuraData.length > 0) {
      console.log('✅ Signal established: ASURA_NODE');
      if (params.title) {
        const query = params.title.toLowerCase();
        return asuraData.filter(m => m.title.toLowerCase().includes(query));
      }
      return asuraData;
    }

    // 2. FLAME NODE (Secondary)
    console.warn('⚠️ Asura Node bypassed. Cascading to FLAME_NODE...');
    const flameData = await fetchFlameLatest();
    if (flameData && flameData.length > 0) {
      console.log('✅ Signal established: FLAME_NODE');
      return flameData;
    }

    // 3. KOMIKU NODE (Tertiary)
    console.warn('⚠️ Flame Node bypassed. Cascading to KOMIKU_NODE...');
    const komikuData = await fetchKomikuLatest();
    if (komikuData && komikuData.length > 0) {
      console.log('✅ Signal established: KOMIKU_NODE');
      return komikuData;
    }

    // CRITICAL FAILURE: All sources unreachable
    console.error('❌ [CRITICAL]: Total Signal Loss. All sources offline.');
    return [];
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
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
    // Chapter fetching for other nodes can be implemented here
    return [];
  },

  async getTags() {
    return { data: [] }; 
  },

  async search(query: string, source: string = 'asura', genres: string[] = []) {
    const all = await this.fetchMangaList({ page: 1, title: query });
    return all;
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.slice(0, 15);
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    // Filter out current and try to find some overlap if possible, otherwise slice
    return all.filter(m => m.id !== currentId).slice(0, 8);
  }
};
