
/**
 * Simple Direct MangaDex API Wrapper
 * Optimized for NoirManhwa: Filters for Manga, Manhwa, and Manhua only.
 */

const MANGADEX_BASE = 'https://api.mangadex.org';

// Format Tag IDs
const NOVEL_TAG_ID = '107fd519-ad95-4296-bd74-3232824da344';

async function fetchMangaDex(endpoint: string, options: RequestInit = {}) {
  const url = `${MANGADEX_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      console.error(`[API Error] ${res.status} on ${endpoint}`);
      return { error: true, status: res.status };
    }

    return res.json();
  } catch (error) {
    console.error(`[API Failure] Network error on ${endpoint}:`, error);
    return { error: true, message: 'Connection failed' };
  }
}

/**
 * Common filters to ensure only Manga, Manhwa, and Manhua are returned.
 * Excludes Novel adaptations to keep the feed clean.
 */
function getStrictFilterParams() {
  const params = new URLSearchParams();
  // Filter by origin languages: Japanese, Korean, Chinese, and Hong Kong Chinese
  params.append('originalLanguage[]', 'ja');
  params.append('originalLanguage[]', 'ko');
  params.append('originalLanguage[]', 'zh');
  params.append('originalLanguage[]', 'zh-hk');
  // Exclude Novel tag
  params.append('excludedTags[]', NOVEL_TAG_ID);
  params.append('contentRating[]', 'safe');
  params.append('contentRating[]', 'suggestive');
  return params;
}

export const mangaApi = {
  getTrending: async () => {
    console.log('[API] Fetching Trending Manga/Manhwa/Manhua');
    const params = getStrictFilterParams();
    params.append('limit', '10');
    params.append('includes[]', 'cover_art');
    params.append('order[followedCount]', 'desc');
    
    return fetchMangaDex(`/manga?${params.toString()}`, {
      next: { revalidate: 3600 }
    });
  },

  getLatest: async (offset = 0) => {
    console.log(`[API] Fetching Latest Uploads (Offset: ${offset})`);
    const params = getStrictFilterParams();
    params.append('limit', '24');
    params.append('offset', offset.toString());
    params.append('includes[]', 'cover_art');
    params.append('order[latestUploadedChapter]', 'desc');
    
    return fetchMangaDex(`/manga?${params.toString()}`, {
      next: { revalidate: 1800 }
    });
  },

  getMangaDetails: async (id: string) => {
    console.log(`[API] Fetching Details for: ${id}`);
    return fetchMangaDex(`/manga/${id}?includes[]=cover_art&includes[]=author`, {
      next: { revalidate: 3600 }
    });
  },

  getChapters: async (mangaId: string) => {
    console.log(`[API] Fetching Chapters for: ${mangaId}`);
    const data = await fetchMangaDex(
      `/manga/${mangaId}/feed?translatedLanguage[]=en&translatedLanguage[]=id&order[chapter]=asc&order[volume]=asc&limit=500`,
      { next: { revalidate: 1800 } }
    );
    
    if (data && data.data) {
      data.data.sort((a: any, b: any) => {
        const chapA = parseFloat(a.attributes.chapter) || 0;
        const chapB = parseFloat(b.attributes.chapter) || 0;
        return chapA - chapB;
      });
    }
    return data;
  },

  getAtHomeServer: async (chapterId: string) => {
    return fetchMangaDex(`/at-home/server/${chapterId}`, {
      next: { revalidate: 3600 }
    });
  },

  search: async ({ title, includedTags = [], status = [], limit = 24 }: { 
    title?: string; 
    includedTags?: string[]; 
    status?: string[]; 
    limit?: number 
  }) => {
    console.log(`[API] Searching Matrix: "${title}"`);
    const params = getStrictFilterParams();
    params.append('limit', limit.toString());
    params.append('includes[]', 'cover_art');
    
    if (title) params.append('title', title);
    includedTags.forEach(t => params.append('includedTags[]', t));
    status.forEach(s => params.append('status[]', s));
    
    return fetchMangaDex(`/manga?${params.toString()}`, {
      next: { revalidate: 600 }
    });
  },

  getTags: async () => {
    return fetchMangaDex('/manga/tag');
  }
};
