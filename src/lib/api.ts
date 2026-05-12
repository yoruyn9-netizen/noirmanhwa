import { Manga, Chapter, AtHomeResponse, SearchParams, MangaDexResponse } from './types';

const BASE_URL = 'https://api.mangadex.org';

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 30000 } = options; // Increased to 30 seconds
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchMangaDex<T>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<T> {
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
      if (res.status === 429 && retries > 0) {
        // Wait 2 seconds and retry on Rate Limit
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchMangaDex<T>(endpoint, options, retries - 1);
      }
      
      const errorText = await res.text();
      console.error(`[MangaDex API Error] ${res.status}:`, errorText);
      throw new Error(res.status === 429 ? 'MangaDex is busy. Please wait.' : `MangaDex error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError' && retries > 0) {
      console.warn(`[MangaDex API] Timeout on ${endpoint}, retrying...`);
      return fetchMangaDex<T>(endpoint, options, retries - 1);
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout. MangaDex is taking too long to respond.');
    }
    throw error;
  }
}

export const mangaApi = {
  getTrending: async (): Promise<MangaDexResponse<Manga[]>> => {
    return fetchMangaDex<MangaDexResponse<Manga[]>>(
      '/manga?limit=12&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive',
      { next: { revalidate: 3600 } }
    );
  },

  getLatest: async (offset = 0, tags: string[] = []): Promise<MangaDexResponse<Manga[]>> => {
    const tagParams = tags.length > 0 ? tags.map(t => `includedTags[]=${t}`).join('&') : '';
    const endpoint = `/manga?limit=24&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe${tagParams ? `&${tagParams}` : ''}`;
    return fetchMangaDex<MangaDexResponse<Manga[]>>(endpoint, { next: { revalidate: 1800 } });
  },

  getMangaDetails: async (id: string): Promise<{ data: Manga }> => {
    return fetchMangaDex<{ data: Manga }>(`/manga/${id}?includes[]=cover_art&includes[]=author`);
  },

  getChapters: async (mangaId: string, offset = 0): Promise<MangaDexResponse<Chapter[]>> => {
    const languages = ['en', 'id', 'pt', 'pt-br', 'es-la'];
    const langParams = languages.map(l => `translatedLanguage[]=${l}`).join('&');
    
    return fetchMangaDex<MangaDexResponse<Chapter[]>>(
      `/manga/${mangaId}/feed?${langParams}&order[chapter]=desc&limit=100&offset=${offset}`,
      { next: { revalidate: 600 } }
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