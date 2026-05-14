/**
 * @fileOverview Unified API Layer - PROXY VERSION
 * Routes all traffic through local Next.js API routes to bypass CORS and spoof browser behavior.
 */

import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';

export const mangaApi = {
  /**
   * Universal List Fetcher via Unified Proxy Matrix
   */
  async fetchMangaList(params: { page: number; title?: string }): Promise<Manga[]> {
    console.log('🔍 [CLIENT] Initiating Proxy Discovery Protocol...');
    
    try {
      const response = await fetch('/api/manga/combined', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CLIENT] Matrix Uplink Failure: ${response.status}`, errorText);
        throw new Error(`Neural Link Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn('⚠️ [CLIENT] Discovery node returned success:false', result.error);
        throw new Error(result.error || 'Failed to sync Discovery Matrix');
      }

      console.log(`✅ [CLIENT] Matrix Sync Success: ${result.total} items loaded`);
      console.log('📊 [CLIENT] Node Health Check:', result.sources);

      let data = result.data || [];

      if (params.title) {
        const query = params.title.toLowerCase();
        data = data.filter((m: any) => m.title.toLowerCase().includes(query));
      }

      return data;
    } catch (error) {
      console.error('❌ [CLIENT] CRITICAL DISCOVERY FAILURE:', error);
      throw error;
    }
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      // In this proxy architecture, we fetch from the combined list and find the match
      const list = await this.fetchMangaList({ page: 1 });
      const manga = list.find(m => m.id === id);
      
      if (!manga) {
        console.warn(`[System]: Node ${id} not localized in sector ${source.toUpperCase()}.`);
        return null;
      }

      // Placeholder for dedicated chapter proxy route
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
    console.log(`📖 [CLIENT] Syncing chapters for node ${mangaId} via ${source.toUpperCase()}`);
    // Currently, chapters are handled via the source-specific drivers
    // This is a placeholder for a future /api/manga/[source]/chapters proxy
    return [];
  },

  async getTags() {
    // Standard genre nodes for discovery
    return { 
      data: [
        { id: 'action', attributes: { name: { en: 'Action' } } },
        { id: 'fantasy', attributes: { name: { en: 'Fantasy' } } },
        { id: 'adventure', attributes: { name: { en: 'Adventure' } } },
        { id: 'romance', attributes: { name: { en: 'Romance' } } }
      ] 
    }; 
  },

  async search(query: string) {
    return this.fetchMangaList({ page: 1, title: query });
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    try {
      const all = await this.fetchMangaList({ page: 1 });
      return all.slice(0, 15);
    } catch (e) {
      return [];
    }
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    try {
      const all = await this.fetchMangaList({ page: 1 });
      // Logic: Match at least one genre or provide random discovery
      const related = all.filter(m => 
        m.id !== currentId && 
        (m.genres?.some(g => genres.includes(g)) || true)
      );
      return related.slice(0, 10);
    } catch (e) {
      return [];
    }
  }
};
