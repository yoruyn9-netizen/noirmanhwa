
import { Manga, MangaSource, Chapter, MangaDetail } from '@/types/manga';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Cache Handler for localized frequency storage
 */
function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedData(key: string, data: any) {
  if (typeof window === 'undefined' || !data || (Array.isArray(data) && data.length === 0)) return;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

/**
 * MangaDex Signal Normalization
 */
function normalizeMangaDex(item: any): Manga {
  const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const coverUrl = fileName 
    ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}.512.jpg`
    : 'https://picsum.photos/seed/manga/400/600';

  const title = item.attributes?.title?.en || item.attributes?.title?.id || (item.attributes?.title ? Object.values(item.attributes.title)[0] : 'Unknown Title');

  return {
    id: item.id,
    title,
    cover: coverUrl,
    status: item.attributes?.status || 'Unknown',
    genres: (item.attributes?.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean),
    source: 'mangadex',
    language: item.attributes?.originalLanguage || 'en',
    description: item.attributes?.description?.en || item.attributes?.description?.id || '',
    author: 'Unknown Author',
    year: item.attributes?.year
  };
}

/**
 * MangaMint Signal Normalization (Sub-Indo)
 */
function normalizeMangaMint(item: any): Manga {
  return {
    id: item.endpoint?.replace(/\//g, '') || item.id,
    title: item.title || 'Unknown Sub-Indo Title',
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
   * Fetches unified signal list from dual sources via local proxy
   */
  async fetchMangaList(page: number, source?: MangaSource): Promise<Manga[]> {
    const cacheKey = `manga_cache_${source || 'all'}_${page}`;
    const cached = getCachedData<Manga[]>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached data for: ${source || 'all'} (Page ${page})`);
      return cached;
    }

    const results: Manga[] = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const fetchPromises = [];

      if (!source || source === 'mangadex') {
        fetchPromises.push(
          fetch(`/api/manga?type=search&limit=20&offset=${(page - 1) * 20}`, { signal: controller.signal })
            .then(res => res.json())
            .then(response => {
              console.log('🌍 MANGADEX SEARCH:', { count: response.data?.length, first: response.data?.[0]?.attributes?.title?.en });
              if (response.data && Array.isArray(response.data)) {
                results.push(...response.data.map(normalizeMangaDex));
              }
            })
            .catch(err => console.error('❌ MangaDex Node Failed:', err))
        );
      }

      if (!source || source === 'mangamint') {
        fetchPromises.push(
          fetch(`/api/mint?path=/manga/page/${page}`, { signal: controller.signal })
            .then(res => res.json())
            .then(mintData => {
              console.log('🇮 MANGAMINT LIST:', { count: mintData.manga_list?.length, first: mintData.manga_list?.[0]?.title });
              if (mintData.manga_list && Array.isArray(mintData.manga_list)) {
                results.push(...mintData.manga_list.map(normalizeMangaMint));
              }
            })
            .catch(err => console.error('❌ MangaMint Node Failed:', err))
        );
      }

      await Promise.all(fetchPromises);
      clearTimeout(timeoutId);
      
      // Shuffle results if combined for variety
      if (!source) {
        results.sort(() => Math.random() - 0.5);
      }

      if (results.length > 0) {
        setCachedData(cacheKey, results);
      }
      
      console.log('✅ TOTAL SYNCHRONIZED:', results.length);
      return results;
    } catch (error) {
      console.error('[CRITICAL]: Synchronization timed out or failed:', error);
      return [];
    }
  },

  /**
   * Extracts detailed node data via proxy
   */
  async fetchMangaDetail(id: string, source: MangaSource): Promise<MangaDetail | null> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`/api/manga?type=details&id=${id}`);
        const data = await res.json();
        if (!data.data) return null;
        
        const manga = normalizeMangaDex(data.data);
        
        const feedRes = await fetch(`/api/manga/${id}/feed`);
        const feedData = await feedRes.json();
        
        const chapters: Chapter[] = (feedData.data || []).map((c: any) => ({
          id: c.id,
          mangaId: id,
          number: c.attributes?.chapter || '?',
          title: c.attributes?.title || `Chapter ${c.attributes?.chapter || '?'}`,
          source: 'mangadex',
          publishAt: c.attributes?.publishAt
        }));

        return { ...manga, chapters };
      } else {
        // Mint requires full endpoint path for detail
        const res = await fetch(`/api/mint?path=/manga/detail/${id}`);
        const data = await res.json();
        const manga = normalizeMangaMint(data);
        
        const chapters: Chapter[] = (data.chapter || []).map((c: any) => ({
          id: c.chapter_endpoint?.replace(/^\//, '').replace(/\//g, '-'), // Flatten path for URL
          mangaId: id,
          number: c.chapter_title?.replace(/[^0-9.]/g, '') || '?',
          title: c.chapter_title || 'Untitled Unit',
          source: 'mangamint'
        }));

        return { ...manga, chapters };
      }
    } catch (err) {
      console.error('[Node Detail Error]:', err);
      return null;
    }
  },

  /**
   * Retrieves visual stream frames for a chapter
   */
  async fetchChapterImages(chapterId: string, source: MangaSource): Promise<string[]> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`/api/at-home/${chapterId}`);
        const data = await res.json();
        const { baseUrl, chapter } = data;
        if (!chapter || !baseUrl) return [];
        // Use data-saver for maximum reliability and speed on mobile
        return (chapter.dataSaver || []).map((file: string) => `${baseUrl}/data-saver/${chapter.hash}/${file}`);
      } else {
        // Restore flattened path
        const mintId = chapterId.replace(/-/g, '/');
        const res = await fetch(`/api/mint?path=/chapter/${mintId}`);
        const data = await res.json();
        return data.chapter_image || [];
      }
    } catch (err) {
      console.error('[Frame Error]:', err);
      return [];
    }
  },

  async search(query: string, source: MangaSource = 'mangadex'): Promise<Manga[]> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`/api/manga?type=search&title=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        return (data.data || []).map(normalizeMangaDex);
      } else {
        const res = await fetch(`/api/mint?path=/search/${encodeURIComponent(query)}`);
        const data = await res.json();
        return (data.manga_list || []).map(normalizeMangaMint);
      }
    } catch {
      return [];
    }
  }
};
