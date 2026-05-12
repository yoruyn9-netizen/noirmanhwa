import { Manga, Chapter, AtHomeResponse, SearchParams, MangaDexResponse } from './types';

const BASE_URL = 'https://api.mangadex.org';

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 45000 } = options; 
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
      // Removed 'next' property as it is server-side only
      cache: 'no-store' 
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchMangaDex<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const res = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      // Retry on rate limit (429) or temporary server errors (5xx)
      if ((res.status === 429 || res.status >= 500) && retries > 0) {
        const backoff = (4 - retries) * 2000; 
        console.warn(`[MangaDex API] ${res.status} on ${endpoint}. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchMangaDex<T>(endpoint, options, retries - 1);
      }
      
      const errorText = await res.text().catch(() => 'No error body');
      console.error(`[MangaDex API Error] ${res.status} on ${endpoint}:`, errorText);
      throw new Error(res.status === 429 ? 'MangaDex is currently busy (Rate Limit). Please wait a moment.' : `MangaDex error: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    if (error.name === 'AbortError' && retries > 0) {
      const backoff = (4 - retries) * 1500;
      console.warn(`[MangaDex API] Timeout on ${endpoint}. Retrying in ${backoff}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchMangaDex<T>(endpoint, options, retries - 1);
    }
    
    if (error.name === 'AbortError') {
      console.error(`[MangaDex API] Permanent Timeout on ${endpoint}`);
      throw new Error('Connection timeout. MangaDex node is not responding.');
    }
    
    throw error;
  }
}

export const mangaApi = {
  getTrending: async (): Promise<MangaDexResponse<Manga[]>> => {
    return fetchMangaDex<MangaDexResponse<Manga[]>>(
      '/manga?limit=12&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive'
    );
  },

  getLatest: async (offset = 0, tags: string[] = []): Promise<MangaDexResponse<Manga[]>> => {
    const tagParams = tags.length > 0 ? tags.map(t => `includedTags[]=${t}`).join('&') : '';
    const endpoint = `/manga?limit=24&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe${tagParams ? `&${tagParams}` : ''}`;
    return fetchMangaDex<MangaDexResponse<Manga[]>>(endpoint);
  },

  getMangaDetails: async (id: string): Promise<{ data: Manga }> => {
    return fetchMangaDex<{ data: Manga }>(`/manga/${id}?includes[]=cover_art&includes[]=author`);
  },

  getChapters: async (mangaId: string, offset = 0): Promise<MangaDexResponse<Chapter[]>> => {
    const languages = ['en', 'id'];
    const langParams = languages.map(l => `translatedLanguage[]=${l}`).join('&');
    
    return fetchMangaDex<MangaDexResponse<Chapter[]>>(
      `/manga/${mangaId}/feed?${langParams}&order[chapter]=desc&limit=100&offset=${offset}`
    );
  },

  getAtHomeServer: async (chapterId: string): Promise<AtHomeResponse> => {
    return fetchMangaDex<AtHomeResponse>(`/at-home/server/${chapterId}`);
  },

  search: async (params: SearchParams): Promise<MangaDexResponse<Manga[]>> => {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.append('title', params.title);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    searchParams.append('includes[]', 'cover_art');
    
    if (params.includedTags) {
      params.includedTags.forEach(tag => searchParams.append('includedTags[]', tag));
    }
    
    if (params.status) {
      params.status.forEach(s => searchParams.append('status[]', s));
    }

    return fetchMangaDex<MangaDexResponse<Manga[]>>(`/manga?${searchParams.toString()}&contentRating[]=safe&contentRating[]=suggestive`);
  },

  getTags: async (): Promise<any> => {
    return fetchMangaDex('/manga/tag');
  }
};