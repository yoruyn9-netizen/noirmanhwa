/**
 * @fileOverview Unified API Layer - RESILIENT VERSION
 * Hardened to handle node latency and matrix failures gracefully.
 */

import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';

export const mangaApi = {
  /**
   * Universal List Fetcher via Optimized Discovery Matrix
   */
  async fetchMangaList(params: { page: number; title?: string }): Promise<Manga[]> {
    try {
      const response = await fetch('/api/manga/combined', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // Log error but don't throw immediately to allow component-level recovery
        const errorText = await response.text();
        console.warn(`⚠️ [CLIENT] Matrix Uplink Warning: ${response.status}`, errorText);
        return [];
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn('⚠️ [CLIENT] Discovery node reported failure:', result.error);
        return [];
      }

      let data = result.data || [];

      if (params.title) {
        const query = params.title.toLowerCase();
        data = data.filter((m: any) => m.title.toLowerCase().includes(query));
      }

      return data;
    } catch (error) {
      console.error('❌ [CLIENT] Neural link interruption:', error);
      return [];
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

      return {
        ...manga,
        chapters: []
      };
    } catch (err) {
      return null;
    }
  },

  async fetchChapters(mangaId: string, source: MangaSource): Promise<Chapter[]> {
    return [];
  },

  async getTags() {
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
    const all = await this.fetchMangaList({ page: 1 });
    return all.slice(0, 15);
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    const all = await this.fetchMangaList({ page: 1 });
    return all.filter(m => m.id !== currentId).slice(0, 10);
  }
};
