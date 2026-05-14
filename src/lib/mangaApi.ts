
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
  }): Promise<Manga[]> {
    const results: Manga[] = [];

    try {
      // 1. ASURA NODE (Primary for Manhwa)
      if (params.type === 'manhwa' || params.type === 'all') {
        const asuraPath = params.title ? `/search?query=${encodeURIComponent(params.title)}` : '/series';
        const asuraRes = await fetch(`/api/asura?path=${asuraPath}`);
        if (asuraRes.ok) {
          const data = await asuraRes.json();
          const list = Array.isArray(data) ? data : data.series || [];
          results.push(...list.map((m: any) => sanitizeManga(m, 'mangadex'))); // Standardizing ID format
        }
      }

      // 2. FLAME NODE (Backup for Manhwa/Manga)
      if (results.length < 10) {
        const flameRes = await fetch(`/api/flame?path=/posts&per_page=20`);
        if (flameRes.ok) {
          const data = await flameRes.json();
          results.push(...data.map((m: any) => sanitizeManga(m, 'mangadex')));
        }
      }

      // 3. MANGADEX NODE (Global Fallback - Verified Real)
      if (results.length < 5) {
        const dexRes = await fetch(`/api/manga?type=trending`);
        const dexData = await dexRes.json();
        if (dexData.data) {
          results.push(...dexData.data.map((m: any) => ({
            id: m.id,
            title: m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0],
            cover: `https://uploads.mangadex.org/covers/${m.id}/${m.relationships?.find((r: any) => r.type === 'cover_art')?.attributes?.fileName}.256.jpg`,
            status: m.attributes?.status,
            genres: m.attributes?.tags?.map((t: any) => t.attributes?.name?.en) || [],
            source: 'mangadex',
            language: 'en',
            type: 'manhwa'
          })));
        }
      }

      if (!validateMangaData(results)) {
        throw new Error('Signal Corrupted: Invalid Data Structure');
      }

      return results;
    } catch (error) {
      console.error('❌ [API ERROR]: Signal Relay Failure', error);
      return [];
    }
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    // REAL IDs for verified titles
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
