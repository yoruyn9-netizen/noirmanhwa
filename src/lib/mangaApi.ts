
/**
 * @fileOverview Unified API Interface - STRICT REAL DATA ONLY
 */

export interface Manga {
  id: string;
  title: string;
  cover: string;
  status: string;
  type: string;
  source: string;
  genres: string[];
}

/**
 * Fetches the composite discovery stream from all nodes.
 */
export async function fetchMangaList(): Promise<Manga[]> {
  try {
    const response = await fetch('/api/manga/combined', {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Neural Link Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Signal Acquisition Failed');
    }

    console.log(`✅ [SIGNAL ESTABLISHED]: ${result.total} real titles loaded.`);
    return result.data || [];
  } catch (error) {
    console.error('❌ [API]: Critical fetch failure.', error);
    throw error;
  }
}

export async function fetchCuratedManhwa(): Promise<Manga[]> {
  return fetchMangaList();
}

export async function fetchChapters(mangaId: string, source: string): Promise<any[]> {
  // Currently optimized for Asura series
  if (source === 'asura') {
    try {
      const res = await fetch(`/api/asura?path=/series/${mangaId}/chapters`);
      const data = await res.json();
      const list = data.chapters || (Array.isArray(data) ? data : []);
      return list.map((ch: any) => ({
        id: ch.id || ch.slug,
        number: ch.number || ch.title,
        title: ch.title,
        source: 'asura'
      })).sort((a: any, b: any) => parseFloat(b.number) - parseFloat(a.number));
    } catch (err) {
      return [];
    }
  }
  return [];
}

export const mangaApi = {
  fetchMangaList,
  fetchCuratedManhwa,
  fetchChapters
};
