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
    const response = await fetch('/api/manga', {
      cache: 'no-store',
      headers: API_HEADERS
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      cover: item.coverUrl,
      status: item.status,
      source: item.source || 'mangadex',
      genres: item.tags || [],
      language: item.language,
      rating: item.rating ?? null,
      year: item.year ?? null,
      description: item.description,
      updatedAt: item.updatedAt ?? null,
    }));
  } catch (error) {
    console.error('[API]: Uplink synchronization failure.', error);
    return [];
  }
}

export async function fetchCuratedManhwa(): Promise<Manga[]> {
  return fetchMangaList();
}

export async function fetchChapters(mangaId: string): Promise<Chapter[]> {
  try {
    const response = await fetch(`/api/chapter?mangaId=${encodeURIComponent(mangaId)}`, {
      cache: 'no-store',
      headers: API_HEADERS
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      mangaId: mangaId,
      number: item.chapter || '0',
      title: item.title || '',
      publishAt: item.publishAt || null,
      source: 'mangadex',
    }));
  } catch (error) {
    console.error(`[Chapters]: ${mangaId} unreachable.`, error);
    return [];
  }
}

export async function fetchMangaDetail(mangaId: string): Promise<MangaDetail> {
  try {
    const response = await fetch(`/api/manga?id=${encodeURIComponent(mangaId)}`, {
      cache: 'no-store',
      headers: API_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Detail fetch failed: ${response.status}`);
    }

    const item = await response.json();
    
    if (!item || !item.id) {
      throw new Error('Invalid manga detail response');
    }

    const manga: MangaDetail = {
      id: item.id,
      title: item.title,
      cover: item.coverUrl,
      status: item.status,
      source: item.source || 'mangadex',
      genres: item.tags || [],
      language: item.language,
      rating: item.rating ?? null,
      year: item.year ?? null,
      description: item.description,
      updatedAt: item.updatedAt ?? null,
      chapters: []
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