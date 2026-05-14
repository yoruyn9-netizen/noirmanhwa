
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

  // Detect content type based on tags and language
  let contentType: 'manga' | 'manhwa' | 'manhua' = 'manga';
  const tags = (item.attributes?.tags || []).map((t: any) => t.attributes?.name?.en.toLowerCase());
  const origin = item.attributes?.originalLanguage;

  if (origin === 'ko' || tags.includes('manhwa')) contentType = 'manhwa';
  else if (origin === 'zh' || tags.includes('manhua')) contentType = 'manhua';

  return {
    id: item.id,
    title,
    cover: coverUrl,
    status: item.attributes?.status || 'Ongoing',
    genres: (item.attributes?.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean),
    source: 'mangadex',
    language: origin || 'en',
    description: item.attributes?.description?.en || item.attributes?.description?.id || '',
    author: 'Unknown Author',
    year: item.attributes?.year,
    type: contentType,
    updatedAt: item.attributes?.updatedAt
  };
}

/**
 * MangaMint Signal Normalization (Sub-Indo)
 */
function normalizeMangaMint(item: any): Manga {
  const endpoint = item.endpoint || '';
  const slug = endpoint.split('/').filter(Boolean).pop() || item.id || 'unknown';

  return {
    id: slug,
    title: item.title || 'Unknown Sub-Indo Title',
    cover: item.thumb || item.image || 'https://picsum.photos/seed/mint/400/600',
    status: item.status || 'Ongoing',
    genres: item.genres || [],
    source: 'mangamint',
    language: 'id',
    description: item.synopsis || '',
    rating: parseFloat(item.score) || undefined,
    type: 'manhwa' // Most Mint content is manhwa
  };
}

export const mangaApi = {
  /**
   * Fetches unified signal list from dual sources via local proxy with advanced filtering
   */
  async fetchMangaList(params: {
    page: number;
    type?: 'all' | 'manhwa' | 'manga' | 'manhua' | 'sub-indo';
    sortBy?: string;
    status?: string[];
    genres?: string[];
    contentRating?: string[];
  }): Promise<Manga[]> {
    const { page, type, sortBy, status, genres, contentRating } = params;
    const cacheKey = `manga_cache_${JSON.stringify(params)}`;
    const cached = getCachedData<Manga[]>(cacheKey);
    
    if (cached) return cached;

    const results: Manga[] = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Build MangaDex Query
      const dexParams = new URLSearchParams();
      dexParams.append('limit', '24');
      dexParams.append('offset', ((page - 1) * 24).toString());
      dexParams.append('includes[]', 'cover_art');
      dexParams.append('includes[]', 'author');

      // Sorting Logic
      if (sortBy === 'popular') dexParams.append('order[followedCount]', 'desc');
      else if (sortBy === 'rating') dexParams.append('order[rating]', 'desc');
      else if (sortBy === 'alphabetical') dexParams.append('order[title]', 'asc');
      else if (sortBy === 'newly-added') dexParams.append('order[createdAt]', 'desc');
      else dexParams.append('order[latestUploadedChapter]', 'desc');

      // Content Type Logic
      if (type === 'manhwa') dexParams.append('originalLanguage[]', 'ko');
      else if (type === 'manga') dexParams.append('originalLanguage[]', 'ja');
      else if (type === 'manhua') dexParams.append('originalLanguage[]', 'zh');

      // Advanced Filters
      status?.forEach(s => dexParams.append('status[]', s));
      genres?.forEach(g => dexParams.append('includedTags[]', g));
      contentRating?.forEach(r => dexParams.append('contentRating[]', r));

      const fetchPromises = [];

      if (type !== 'sub-indo') {
        fetchPromises.push(
          fetch(`/api/manga?type=search&${dexParams.toString()}`, { signal: controller.signal })
            .then(res => res.json())
            .then(response => {
              if (response.data) {
                console.log(`🌍 MANGADEX [${type}]:`, response.data.length);
                results.push(...response.data.map(normalizeMangaDex));
              }
            })
        );
      }

      if (type === 'sub-indo' || type === 'all' || type === 'manhwa') {
        fetchPromises.push(
          fetch(`/api/mint?path=/manga/page/${page}`, { signal: controller.signal })
            .then(res => res.json())
            .then(mintData => {
              const list = mintData.manga_list || mintData.data || [];
              if (Array.isArray(list)) {
                console.log('🇮 MANGAMINT:', list.length);
                results.push(...list.map(normalizeMangaMint));
              }
            })
        );
      }

      await Promise.all(fetchPromises);
      clearTimeout(timeoutId);
      
      // Shuffle only on 'all' tab
      if (type === 'all') results.sort(() => Math.random() - 0.5);

      if (results.length > 0) setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[API Sync Error]:', error);
      return [];
    }
  },

  async fetchCuratedManhwa(): Promise<Manga[]> {
    const curatedIds = [
      '32d76d5e-7971-4770-9679-052a3560647c', // Solo Leveling
      '27263590-3486-455b-9b43-5798991a0c0e', // Lookism
      'c03a6104-ada7-46a2-a153-bdbad3956ca9', // Tower of God
      'c1682f6e-57ef-493e-8c31-29ef31d59521', // Omniscient Reader
      '82772583-a99a-4f51-b882-77be834c8784', // TBATE
      '632df67e-49b8-4d51-8761-1250f1469e38', // Return of Mount Hua
      'a35639f7-6401-4475-8164-32525492d2b5', // Nano Machine
      '6d3765f0-d9d1-419b-b0b0-379e5192a543'  // Leveling with the Gods
    ];

    try {
      const res = await fetch(`/api/manga?type=search&ids[]=${curatedIds.join('&ids[]=')}&includes[]=cover_art`);
      const data = await res.json();
      return (data.data || []).map(normalizeMangaDex);
    } catch {
      return [];
    }
  },

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
        const res = await fetch(`/api/mint?path=/manga/detail/${id}`);
        const data = await res.json();
        const detail = data.manga_detail || data;
        const manga = normalizeMangaMint(detail);
        
        const chapters: Chapter[] = (data.chapter || []).map((c: any) => {
          const endpoint = c.chapter_endpoint || '';
          const chapterId = endpoint.split('/').filter(Boolean).join('-');
          return {
            id: chapterId,
            mangaId: id,
            number: c.chapter_title?.replace(/[^0-9.]/g, '') || '?',
            title: c.chapter_title || 'Untitled Chapter',
            source: 'mangamint'
          };
        });

        return { ...manga, chapters };
      }
    } catch (err) {
      return null;
    }
  },

  async fetchChapterImages(chapterId: string, source: MangaSource): Promise<string[]> {
    try {
      if (source === 'mangadex') {
        const res = await fetch(`/api/at-home/${chapterId}`);
        const data = await res.json();
        const { baseUrl, chapter } = data;
        if (!chapter || !baseUrl) return [];
        return (chapter.dataSaver || []).map((file: string) => `${baseUrl}/data-saver/${chapter.hash}/${file}`);
      } else {
        const mintId = chapterId.replace(/-/g, '/');
        const res = await fetch(`/api/mint?path=/chapter/${mintId}`);
        const data = await res.json();
        return data.chapter_image || [];
      }
    } catch (err) {
      return [];
    }
  },

  async getTags() {
    const res = await fetch('/api/manga?type=tags');
    return res.json();
  }
};
