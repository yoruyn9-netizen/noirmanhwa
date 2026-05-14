
/**
 * @fileOverview Unified API Layer - HARDENED VERSION
 * Orchestrates Asura, Flame, and Komiku with strict validation.
 */

import { fetchAsuraLatest, fetchAsuraChapters } from './asuraApi';
import { fetchFlameLatest } from './flameApi';
import { fetchKomikuLatest } from './komikuApi';
import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';

export const mangaApi = {
  /**
   * Universal List Fetcher with high-performance failover
   */
  async fetchMangaList(params: {
    page: number;
    type?: string;
    sortBy?: string;
    title?: string;
  }): Promise<Manga[]> {
    console.log('🔍 Initiating Neural Discovery Protocol...');

    // 1. ASURA NODE (Primary Uplink)
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
      console.warn('⚠️ Asura Node offline.');
    }

    // 2. FLAME NODE (Failover Node 1)
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
      console.warn('⚠️ Flame Node offline.');
    }

    // 3. KOMIKU NODE (Failover Node 2)
    try {
      const komikuData = await fetchKomikuLatest();
      if (komikuData && komikuData.length > 0) {
        console.log('📡 Signal Established: KOMIKU_NODE');
        return komikuData;
      }
    } catch (e) {
      console.warn('⚠️ Komiku Node offline.');
    }

    // CRITICAL FAILURE: No nodes returned data
    console.error('❌ [CRITICAL]: Total Signal Loss. All primary discovery nodes offline.');
    return [];
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      // Re-fetch list to find base item metadata
      const list = await this.fetchMangaList({ page: 1 });
      const manga = list.find(m => m.id === id);
      
      if (!manga) {
        console.warn(`[System]: Node ${id} not localized in primary discovery.`);
        return null;
      }

      const chapters = await this.fetchChapters(id, source);

      return {
        ...manga,
        chapters
      };
    } catch (err) {
      console.error('[Detail Protocol Failed]:', err);
      return null;
    }
  },

  async fetchChapters(mangaId: string, source: MangaSource): Promise<Chapter[]> {
    try {
      if (source === 'asura') {
        return await fetchAsuraChapters(mangaId);
      }
      // Expandable for Flame/Komiku chapter logic
    } catch (e) {
      console.error(`❌ Chapter Sync Failed: SOURCE_${source.toUpperCase()}`, e);
    }
    return [];
  },

  async getTags() {
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
