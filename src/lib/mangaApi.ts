/**
 * @fileOverview Unified API Layer - PROXY VERSION
 * Routes all traffic through local Next.js API routes to bypass CORS.
 */

import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';

export const mangaApi = {
  /**
   * Universal List Fetcher via Unified Proxy Matrix
   */
  async fetchMangaList(params: { page: number; title?: string }): Promise<Manga[]> {
    console.log('🔍 Initiating Proxy Discovery Protocol...');
    
    try {
      const response = await fetch('/api/manga/combined', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Neural Link Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sync Discovery Matrix');
      }

      console.log('✅ MATRIX SYNC SUCCESS:', result.total, 'items loaded');
      console.log('📊 Node Health:', result.sources);

      let data = result.data || [];

      if (params.title) {
        const query = params.title.toLowerCase();
        data = data.filter((m: any) => m.title.toLowerCase().includes(query));
      }

      return data;
    } catch (error) {
      console.error('❌ UPLINK CRITICAL FAILURE:', error);
      throw error;
    }
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      const list = await this.fetchMangaList({ page: 1 });
      const manga = list.find(m => m.id === id);
      
      if (!manga) {
        console.warn(`[System]: Node ${id} not localized.`);
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
    // To be implemented via proxy routes in /api/manga/[source]/chapters
    return [];
  },

  async getTags() {
    return { data: [] }; 
  },

  async search(query: string) {
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
