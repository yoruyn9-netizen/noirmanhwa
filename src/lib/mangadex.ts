
import { NextRequest, NextResponse } from 'next/server';

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

export interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    isLocked: boolean;
    links: Record<string, string>;
    originalLanguage: string;
    lastVolume: string | null;
    lastChapter: string | null;
    publicationDemographic: 'shounen' | 'shoujo' | 'josei' | 'seinen' | null;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    year: number | null;
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
    tags: Array<{
      id: string;
      type: 'tag';
      attributes: {
        name: Record<string, string>;
        description: Record<string, any>;
        group: 'content' | 'format' | 'genre' | 'theme';
        version: number;
      };
    }>;
    state: 'published';
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: Array<{
    id: string;
    type: 'cover_art' | 'author' | 'artist' | 'scanlation_group';
    attributes?: {
      description?: string;
      volume?: string | null;
      fileName?: string;
      locale?: string;
      createdAt?: string;
      updatedAt?: string;
      version?: number;
      name?: string;
    };
  }>;
}

export interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
   relationships: Array<{
    id: string;
    type: 'scanlation_group' | 'manga' | 'user';
    attributes?: {
      name?: string;
    }
  }>;
}


export interface MangaDexImageServer {
    result: 'ok' | 'error';
    baseUrl: string;
    chapter: {
        hash: string;
        data: string[];
        dataSaver: string[];
    };
}


// -----------------------------------------------------------------------------
// CONSTANTS & HEADERS
// -----------------------------------------------------------------------------

const MANGADEX_API_BASE = 'https://api.mangadex.org';

const MANGADEX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangadex.org/',
  'Origin': 'https://mangadex.org'
};

// -----------------------------------------------------------------------------
// CORE FETCH LOGIC
// -----------------------------------------------------------------------------

/**
 * Fetches data from MangaDex with retry logic for rate limiting and transient errors.
 * @param url Full URL to fetch.
 * @param retries Number of retries on failure.
 * @returns A promise that resolves to the response or null on persistent failure.
 */
export async function fetchWithRetry(url: string, retries = 4, delay = 1200): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: MANGADEX_HEADERS, cache: 'no-store' });
      if (res.ok) {
        return res;
      }

      const shouldRetry = res.status === 429 || res.status >= 500;
      if (!shouldRetry) {
        console.warn(`[MangaDex] Fetch failed for ${url} with status ${res.status}. Not retrying.`);
        return res;
      }

      const wait = delay * Math.pow(2, attempt);
      console.warn(`[MangaDex] Retrying ${url} (${attempt + 1}/${retries}) after ${wait}ms due to status ${res.status}`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    } catch (error) {
      if (attempt >= retries - 1) {
        console.error(`[MangaDex] Fetch failed permanently for ${url}:`, error);
        return null;
      }
      const wait = delay * Math.pow(2, attempt);
      console.warn(`[MangaDex] Fetch exception for ${url}. Retrying in ${wait}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// API-FACING FUNCTIONS
// -----------------------------------------------------------------------------

export async function fetchMangaList() {
    const url = `${MANGADEX_API_BASE}/manga?limit=20&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    return res.json();
}

export async function fetchMangaDetail(id: string) {
    const url = `${MANGADEX_API_BASE}/manga/${id}?includes[]=cover_art&includes[]=author`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    return res.json();
}

export async function fetchChapters(id: string) {
    const url = `${MANGADEX_API_BASE}/manga/${id}/feed?limit=500&includes[]=scanlation_group&order[chapter]=asc&translatedLanguage[]=en&translatedLanguage[]=id&translatedLanguage[]=ko`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    return res.json();
}

export async function fetchImageServerUrl(chapterId: string): Promise<MangaDexImageServer | null> {
    const url = `${MANGADEX_API_BASE}/at-home/server/${chapterId}`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    if (!res.ok) {
      console.warn(`[MangaDex] Image server request failed for ${chapterId}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data.result !== 'ok') return null;
    return data;
}

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Constructs the full cover URL from manga data.
 */
export function constructCoverUrl(manga: MangaDexManga, size: '.512.jpg' | '.256.jpg' | '' = '.512.jpg'): string {
  const coverRel = manga.relationships.find(r => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  return fileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}${size}`
    : '/placeholder-cover.jpg'; // Fallback image
}

/**
 * Safely extracts the display title from a manga's title object.
 */
export function getDisplayTitle(manga: MangaDexManga): string {
    const title = manga.attributes.title;
    return title?.en || title?.['ja-ro'] || Object.values(title || {})[0] || 'Untitled';
}

/**
 * Sorts chapters numerically in ascending order.
 */
export function sortChapters(chapters: MangaDexChapter[]): MangaDexChapter[] {
  if (!chapters) return [];
  return chapters.sort((a, b) => {
    const numA = parseFloat(a.attributes.chapter || '0');
    const numB = parseFloat(b.attributes.chapter || '0');
    if (numA === numB) return 0;
    return numA > numB ? 1 : -1;
  });
}
