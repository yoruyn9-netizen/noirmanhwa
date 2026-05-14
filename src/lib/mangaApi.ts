
import { Manga, MangaSource, Chapter, MangaDetail, MangaListResponse } from '@/types/manga';

const MANGADEX_BASE = 'https://api.mangadex.org';
const MANGAMINT_BASE = 'https://mangamint.kaedenoki.net/api';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Internal cache handler for localStorage
 */
function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
}

function setCachedData(key: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

/**
 * MANGADEX NORMALIZER
 */
function normalizeMangaDex(item: any): Manga {
  const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const coverUrl = fileName 
    ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}.512.jpg`
    : 'https://picsum.photos/seed/manga/400/600';

  const title = item.attributes.title.en || item.attributes.title.id || Object.values(item.attributes.title)[0] as string;

  return {
    id: item.id,
    title,
    cover: coverUrl,
    status: item.attributes.status,
    genres: item.attributes.tags.map((t: any) => t.attributes.name.en),
    source: 'mangadex',
    language: item.attributes.originalLanguage,
    description: item.attributes.description.en || item.attributes.description.id || '',
    author: 'Unknown',
    year: item.attributes.year
  };
}

/**
 * MANGAMINT NORMALIZER
 */
function normalizeMangaMint(item: any): Manga {
  return {
    id: item.endpoint || item.id,
    title: item.title,
    cover: item.thumb || item.image || 'https://picsum.photos/seed/mint/400/600',
    status: item.status || 'Ongoing',
    genres: item.genres || [],
    source: 'mangamint',
    language: 'id',
    description: item.synopsis || '',
  };
}

export const mangaApi = {
  /**
   * Fetches lists from both sources in parallel with normalization and caching.
   */
  async fetchMangaList(page: number, source?: MangaSource): Promise<Manga[]> {
    const cacheKey = `manga_cache_${source || 'all'}_${page}`;
    const cached = getCachedData<Manga[]>(cacheKey);
    if (cached) return cached;

    const results: Manga[] = [];

    try {
      if (!source || source === 'mangadex') {
        const res = await fetch(`${MANGADEX_BASE}/manga?limit=20&offset=${(page - 1) * 20}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[followedCount]=desc`);
        const data = await res.json();
        if (data.data) results.push(...data.data.map(normalizeMangaDex));
      }

      if (!source || source === 'mangamint') {
        const res = await fetch(`${MANGAMINT_BASE}/manga/page/${page}`);
        const data = await res.json();
        if (data.manga_list) results.push(...data.manga_list.map(normalizeMangaMint));
      }
    } catch (error) {
      console.error('[API Failure]:', error);
      // If one fails, we still return what we have (fallback)
    }

    setCachedData(cacheKey, results);
    return results;
  },

  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`${MANGADEX_BASE}/manga/${id}?includes[]=cover_art&includes[]=author`);
        const data = await res.json();
        const manga = normalizeMangaDex(data.data);
        
        const feedRes = await fetch(`${MANGADEX_BASE}/manga/${id}/feed?translatedLanguage[]=id&translatedLanguage[]=en&order[chapter]=desc&limit=500`);
        const feedData = await feedRes.json();
        
        const chapters: Chapter[] = feedData.data.map((c: any) => ({
          id: c.id,
          mangaId: id,
          number: c.attributes.chapter,
          title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
          source: 'mangadex',
          publishAt: c.attributes.publishAt
        }));

        return { ...manga, chapters };
      } else {
        const res = await fetch(`${MANGAMINT_BASE}/manga/detail/${id}`);
        const data = await res.json();
        const manga = normalizeMangaMint(data);
        
        const chapters: Chapter[] = (data.chapter || []).map((c: any) => ({
          id: c.chapter_endpoint,
          mangaId: id,
          number: c.chapter_title.replace(/[^0-9.]/g, ''),
          title: c.chapter_title,
          source: 'mangamint'
        }));

        return { ...manga, chapters };
      }
    } catch (err) {
      console.error('[Detail Failure]:', err);
      return null;
    }
  },

  async fetchChapterImages(chapterId: string, source: MangaSource): Promise<string[]> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`${MANGADEX_BASE}/at-home/server/${chapterId}`);
        const data = await res.json();
        const { baseUrl, chapter } = data;
        return chapter.dataSaver.map((file: string) => `${baseUrl}/data-saver/${chapter.hash}/${file}`);
      } else {
        const res = await fetch(`${MANGAMINT_BASE}/chapter/${chapterId}`);
        const data = await res.json();
        return data.chapter_image || [];
      }
    } catch (err) {
      console.error('[Reader Failure]:', err);
      return [];
    }
  },

  async search(query: string, source: MangaSource = 'mangadex'): Promise<Manga[]> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`${MANGADEX_BASE}/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art`);
        const data = await res.json();
        return data.data.map(normalizeMangaDex);
      } else {
        const res = await fetch(`${MANGAMINT_BASE}/search/${encodeURIComponent(query)}`);
        const data = await res.json();
        return (data.manga_list || []).map(normalizeMangaMint);
      }
    } catch {
      return [];
    }
  }
};
