
import { Manga, Chapter, MangaDetail, MangaSource } from '@/types/manga';
import { validateMangaData, sanitizeManga } from './apiValidator';

export const mangaApi = {
  /**
   * Universal List Fetcher
   * Routes through real API nodes only. No mock data allowed.
   */
  async fetchMangaList(params: {
    page: number;
    type?: 'all' | 'manhwa' | 'manga' | 'manhua' | 'sub-indo';
    sortBy?: string;
    title?: string;
    genres?: string[];
    status?: string[];
    contentRating?: string[];
  }): Promise<Manga[]> {
    const results: Manga[] = [];

    try {
      // 1. ASURA NODE (Primary for Manhwa)
      if (params.type === 'manhwa' || params.type === 'all' || params.title) {
        const asuraPath = params.title ? `/search?query=${encodeURIComponent(params.title)}` : '/series';
        const asuraRes = await fetch(`/api/asura?path=${asuraPath}`);
        if (asuraRes.ok) {
          const data = await asuraRes.json();
          const list = Array.isArray(data) ? data : data.series || [];
          results.push(...list.map((m: any) => sanitizeManga(m, 'mangadex')));
        }
      }

      // 2. MANGADEX NODE (Global Fallback - Verified Real)
      if (results.length < 10) {
        const dexRes = await fetch(`/api/manga?type=trending`);
        const dexData = await dexRes.json();
        if (dexData.data) {
          results.push(...dexData.data.map((m: any) => ({
            id: m.id,
            title: m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0],
            cover: `https://uploads.mangadex.org/covers/${m.id}/${m.relationships?.find((r: any) => r.type === 'cover_art')?.attributes?.fileName}.256.jpg`,
            status: m.attributes?.status || 'Ongoing',
            genres: m.attributes?.tags?.map((t: any) => t.attributes?.name?.en) || [],
            source: 'mangadex' as MangaSource,
            language: 'en',
            type: 'manhwa'
          })));
        }
      }

      return results.filter(m => {
        if (params.genres && params.genres.length > 0) {
          return params.genres.some(g => m.genres.includes(g));
        }
        return true;
      });
    } catch (error) {
      console.error('❌ [API ERROR]: Signal Relay Failure', error);
      return [];
    }
  },

  async search(query: string, source: string, genres: string[]): Promise<Manga[]> {
    return this.fetchMangaList({
      page: 1,
      title: query,
      type: source === 'mangamint' ? 'sub-indo' : 'all',
      genres
    });
  },

  async getTags() {
    try {
      const res = await fetch('/api/manga?type=tags');
      return await res.json();
    } catch {
      return { data: [] };
    }
  },

  async fetchRecommendations(currentId: string, genres: string[]): Promise<Manga[]> {
    const list = await this.fetchMangaList({
      page: 1,
      type: 'all',
      genres: genres.slice(0, 2)
    });
    return list.filter(m => m.id !== currentId).slice(0, 10);
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    const targetSlugs = ['solo-leveling', 'lookism', 'tower-of-god', 'omniscient-readers-viewpoint'];
    const results = await Promise.all(
      targetSlugs.map(slug => 
        fetch(`/api/asura?path=/series/${slug}`).then(r => r.json()).catch(() => null)
      )
    );
    return results.filter(Boolean).map(m => sanitizeManga(m, 'mangadex'));
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      const res = await fetch(`/api/manga?type=details&id=${id}`);
      const data = await res.json();
      if (!data.data) return null;
      
      const manga = sanitizeManga(data.data, source);
      const feedRes = await fetch(`/api/manga/${id}/feed`);
      const feedData = await feedRes.json();
      
      const chapters: Chapter[] = (feedData.data || []).map((c: any) => ({
        id: c.id,
        mangaId: id,
        number: c.attributes?.chapter || '?',
        title: c.attributes?.title || `Chapter ${c.attributes?.chapter}`,
        source: 'mangadex',
        publishAt: c.attributes?.publishAt
      }));

      return { ...manga, chapters };
    } catch {
      return null;
    }
  },

  async fetchChapterImages(chapterId: string): Promise<string[]> {
    const res = await fetch(`/api/at-home/${chapterId}`);
    const data = await res.json();
    const { baseUrl, chapter } = data;
    if (!chapter || !baseUrl) return [];
    return chapter.dataSaver.map((file: string) => `${baseUrl}/data-saver/${chapter.hash}/${file}`);
  }
};
