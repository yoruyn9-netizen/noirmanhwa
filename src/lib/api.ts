
import { Manga, Chapter, AtHomeResponse, SearchParams, MangaDexResponse } from './types';

/**
 * Robust fetcher with Proxy support, Timeout, and Exponential Backoff Retries.
 */
async function fetchWithRetry<T>(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<T> {
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true';
  const timeout = 10000; // 10s per request
  
  if (isDebug) console.log(`[Proxy Request] Initiating: ${url}`);

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(id);

    if (isDebug) console.log(`[Proxy Response] Status: ${response.status} for ${url}`);

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        if (retries > 0) {
          if (isDebug) console.warn(`[Proxy Retry] ${url} failed. Retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          return fetchWithRetry<T>(url, options, retries - 1, backoff * 2);
        }
      }
      throw new Error(`Proxy Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      if (retries > 0) {
        if (isDebug) console.warn(`[Proxy Timeout] ${url} timed out. Retrying...`);
        return fetchWithRetry<T>(url, options, retries - 1, backoff * 2);
      }
      throw new Error('MangaDex Proxy Timeout: Node is unresponsive.');
    }
    if (retries > 0) return fetchWithRetry<T>(url, options, retries - 1, backoff * 2);
    throw error;
  }
}

export const mangaApi = {
  getTrending: async (): Promise<MangaDexResponse<Manga[]>> => {
    return fetchWithRetry<MangaDexResponse<Manga[]>>('/api/manga?type=trending');
  },

  getLatest: async (offset = 0, tags: string[] = []): Promise<MangaDexResponse<Manga[]>> => {
    const query = new URLSearchParams({
      type: 'latest',
      offset: offset.toString(),
    });
    tags.forEach(t => query.append('includedTags[]', t));
    return fetchWithRetry<MangaDexResponse<Manga[]>>(`/api/manga?${query.toString()}`);
  },

  getMangaDetails: async (id: string): Promise<{ data: Manga }> => {
    return fetchWithRetry<{ data: Manga }>(`/api/manga?type=details&id=${id}`);
  },

  getChapters: async (mangaId: string, offset = 0): Promise<MangaDexResponse<Chapter[]>> => {
    return fetchWithRetry<MangaDexResponse<Chapter[]>>(`/api/manga/${mangaId}/feed?offset=${offset}`);
  },

  getAtHomeServer: async (chapterId: string): Promise<AtHomeResponse> => {
    return fetchWithRetry<AtHomeResponse>(`/api/at-home/${chapterId}`);
  },

  search: async (params: SearchParams): Promise<MangaDexResponse<Manga[]>> => {
    const query = new URLSearchParams({ type: 'search' });
    if (params.title) query.set('title', params.title);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());
    if (params.includedTags) params.includedTags.forEach(t => query.append('includedTags[]', t));
    if (params.status) params.status.forEach(s => query.append('status[]', s));

    return fetchWithRetry<MangaDexResponse<Manga[]>>(`/api/manga?${query.toString()}`);
  },

  getTags: async (): Promise<any> => {
    return fetchWithRetry('/api/manga?type=tags');
  }
};
