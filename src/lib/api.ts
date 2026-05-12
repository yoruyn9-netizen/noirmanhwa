import { Manga, Chapter, AtHomeResponse, SearchParams, MangaDexResponse } from './types';

const BASE_URL = 'https://api.mangadex.org';

async function fetchMangaDex<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limited. Please wait a moment.');
    }
    throw new Error(`MangaDex API error: ${res.statusText}`);
  }

  return res.json();
}

export const mangaApi = {
  getTrending: async (): Promise<MangaDexResponse<Manga[]>> => {
    return fetchMangaDex<MangaDexResponse<Manga[]>>(
      '/manga?limit=12&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive',
      { next: { revalidate: 3600 } }
    );
  },

  getLatest: async (offset = 0): Promise<MangaDexResponse<Manga[]>> => {
    return fetchMangaDex<MangaDexResponse<Manga[]>>(
      `/manga?limit=20&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe`,
      { next: { revalidate: 1800 } }
    );
  },

  getMangaDetails: async (id: string): Promise<{ data: Manga }> => {
    return fetchMangaDex<{ data: Manga }>(`/manga/${id}?includes[]=cover_art&includes[]=author`);
  },

  getChapters: async (mangaId: string, offset = 0): Promise<MangaDexResponse<Chapter[]>> => {
    return fetchMangaDex<MangaDexResponse<Chapter[]>>(
      `/manga/${mangaId}/feed?translatedLanguage[]=en&translatedLanguage[]=id&order[chapter]=desc&limit=50&offset=${offset}`
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

    return fetchMangaDex<MangaDexResponse<Manga[]>>(`/manga?${searchParams.toString()}`);
  },

  getTags: async (): Promise<any> => {
    return fetchMangaDex('/manga/tag');
  }
};