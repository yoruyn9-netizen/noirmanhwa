/**
 * @fileOverview Unified API Interface - REAL DATA ONLY
 */

export interface Manga {
  id: string;
  title: string;
  cover: string;
  status: string;
  source: string;
  genres: string[];
  language?: string;
  rating?: number | null;
  year?: number | string | null;
  description?: string;
  updatedAt?: string | null;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: string;
  title: string;
  publishAt?: string | null;
  source: string;
}

export interface MangaDetail extends Manga {
  chapters: Chapter[];
}

const API_HEADERS = { 'Content-Type': 'application/json' };

export async function fetchMangaList(): Promise<Manga[]> {
  try {
    const response = await fetch('/api/manga/combined', {
      cache: 'no-store',
      headers: API_HEADERS
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API ERROR]:', errorData.error || `HTTP ${response.status}`);
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error || 'No manga data available');
    }

    return result.data;
  } catch (error) {
    console.error('[API]: Uplink synchronization failure.', error);
    throw error;
  }
}

export async function fetchCuratedManhwa(): Promise<Manga[]> {
  return fetchMangaList();
}

export async function fetchChapters(mangaId: string): Promise<Chapter[]> {
  try {
    const response = await fetch(`/api/manga/chapters/${encodeURIComponent(mangaId)}`, {
      cache: 'no-store',
      headers: API_HEADERS
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Chapter fetch failed: ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success || !Array.isArray(payload.data)) {
      throw new Error(payload.error || 'Invalid chapter payload');
    }

    return payload.data;
  } catch (error) {
    console.error(`[Chapters]: ${mangaId} unreachable.`, error);
    throw error;
  }
}

export async function fetchMangaDetail(mangaId: string): Promise<MangaDetail> {
  try {
    const [detailRes, chapterRes] = await Promise.all([
      fetch(`/api/manga?type=details&id=${encodeURIComponent(mangaId)}`, {
        cache: 'no-store',
        headers: API_HEADERS
      }),
      fetch(`/api/manga/chapters/${encodeURIComponent(mangaId)}`, {
        cache: 'no-store',
        headers: API_HEADERS
      })
    ]);

    if (!detailRes.ok) {
      const errorData = await detailRes.json().catch(() => ({}));
      throw new Error(errorData.error || `Detail fetch failed: ${detailRes.status}`);
    }

    if (!chapterRes.ok) {
      const errorData = await chapterRes.json().catch(() => ({}));
      throw new Error(errorData.error || `Chapter fetch failed: ${chapterRes.status}`);
    }

    const detailPayload = await detailRes.json();
    const chapterPayload = await chapterRes.json();

    const coverRel = Array.isArray(detailPayload?.data?.relationships)
      ? detailPayload.data.relationships.find((rel: any) => rel.type === 'cover_art')
      : null;
    const fileName = coverRel?.attributes?.fileName;
    const coverUrl = fileName ? `https://uploads.mangadex.org/covers/${detailPayload.data.id}/${fileName}.512.jpg` : '';

    const manga: MangaDetail = {
      id: detailPayload.data.id,
      title: detailPayload.data.attributes?.title?.en || detailPayload.data.attributes?.title?.en_jp || Object.values(detailPayload.data.attributes?.title || {})?.[0] || 'Unknown Title',
      cover: coverUrl,
      status: detailPayload.data.attributes?.status || 'ongoing',
      source: 'mangadex',
      genres: Array.isArray(detailPayload.data.attributes?.tags)
        ? detailPayload.data.attributes.tags.map((tag: any) => tag.attributes?.name?.en || 'Unknown')
        : [],
      language: detailPayload.data.attributes?.originalLanguage || 'unknown',
      rating: null,
      year: detailPayload.data.attributes?.year || null,
      description: detailPayload.data.attributes?.description?.en || '',
      updatedAt: detailPayload.data.attributes?.updatedAt || null,
      chapters: Array.isArray(chapterPayload.data) ? chapterPayload.data : []
    };

    return manga;
  } catch (error) {
    console.error('[MangaDetail]:', error);
    throw error;
  }
}

export async function fetchRecommendations(mangaId: string, genres: string[]): Promise<Manga[]> {
  const all = await fetchMangaList();
  return all
    .filter((m) => m.id !== mangaId && m.genres.some((genre) => genres.includes(genre)))
    .slice(0, 10);
}

export const mangaApi = {
  fetchMangaList,
  fetchCuratedManhwa,
  fetchChapters,
  fetchMangaDetail,
  fetchRecommendations
};
