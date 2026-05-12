
/**
 * Simple Direct MangaDex API Wrapper
 */

const MANGADEX_BASE = 'https://api.mangadex.org';

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
      const errorData = await res.json().catch(() => ({}));
      return { error: true, status: res.status, data: errorData };
    }

    return res.json();
  } catch (error) {
    console.error(`[API Failure] Network error on ${endpoint}:`, error);
    return { error: true, message: 'Connection failed' };
  }
}

export const mangaApi = {
  getTrending: async () => {
    console.log('[API] Fetching Trending Manga');
    return fetchMangaDex('/manga?limit=10&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive', {
      next: { revalidate: 3600 }
    });
  },

  getLatest: async (offset = 0) => {
    console.log(`[API] Fetching Latest Manga (Offset: ${offset})`);
    return fetchMangaDex(`/manga?limit=24&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe`, {
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
    
    // Manual sort to ensure numerical accuracy
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
    console.log(`[API] Fetching At-Home Server for Chapter: ${chapterId}`);
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
    console.log(`[API] Searching: "${title}"`);
    const params = new URLSearchParams({
      limit: limit.toString(),
      'includes[]': 'cover_art',
    });
    
    if (title) params.append('title', title);
    includedTags.forEach(t => params.append('includedTags[]', t));
    status.forEach(s => params.append('status[]', s));
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    
    return fetchMangaDex(`/manga?${params.toString()}`, {
      next: { revalidate: 600 }
    });
  },

  getTags: async () => {
    return fetchMangaDex('/manga/tag');
  }
};
