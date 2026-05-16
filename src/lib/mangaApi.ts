
/**
 * @fileOverview Unified API Interface - REAL DATA ONLY
 */

export interface Manga {
  id: string;
  title: string;
  cover: string;
  status: string;
  type: string;
  source: string;
  genres: string[];
  updatedAt?: string;
  rating?: number | string;
  year?: string | number;
}

/**
 * Fetches the composite discovery stream from the hardened matrix.
 * Throws error instead of returning empty array - never use fallback data.
 */
export async function fetchMangaList(params?: any): Promise<Manga[]> {
  try {
    const response = await fetch('/api/manga/combined', {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [API ERROR]:', errorData.error || `HTTP ${response.status}`);
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'No manga data available');
    }

    console.log(`✅ [SIGNAL ESTABLISHED]: ${result.data.length} real titles loaded.`);
    return result.data;
  } catch (error) {
    console.error('❌ [API]: Uplink synchronization failure.', error);
    // THROW error, never return fallback data
    throw error;
  }
}

export async function fetchCuratedManhwa(): Promise<Manga[]> {
  return fetchMangaList();
}

export async function fetchChapters(mangaId: string, source: string): Promise<any[]> {
  try {
    const endpoint = source === 'asura' 
      ? `/api/asura?path=/series/${mangaId}/chapters`
      : `/api/flame?path=/posts/${mangaId}`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`Failed to fetch chapters from ${source}: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.chapters && !Array.isArray(data)) {
      throw new Error(`Invalid chapter data from ${source}`);
    }
    
    const list = data.chapters || (Array.isArray(data) ? data : []);
    
    return list.map((ch: any) => ({
      id: ch.id || ch.slug || ch.ID,
      number: ch.number || ch.title || '?',
      title: ch.title || `Chapter ${ch.number}`,
      source: source
    })).sort((a: any, b: any) => parseFloat(b.number) - parseFloat(a.number));
  } catch (err) {
    console.error(`❌ [Chapters]: Node ${mangaId} unreachable.`, err);
    throw err;
  }
}

export async function fetchRecommendations(mangaId: string, genres: string[]): Promise<Manga[]> {
  const all = await fetchMangaList();
  return all
    .filter(m => m.id !== mangaId && m.genres.some(g => genres.includes(g)))
    .slice(0, 10);
}

export const mangaApi = {
  fetchMangaList,
  fetchCuratedManhwa,
  fetchChapters,
  fetchRecommendations
};
