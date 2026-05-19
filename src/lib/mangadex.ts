
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

const SPOOFED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangadex.org/'
};

// -----------------------------------------------------------------------------
// CORE FETCH LOGIC
// -----------------------------------------------------------------------------

/**
 * Fetches data from MangaDex with retry logic for rate limiting.
 * @param url Full URL to fetch.
 * @param retries Number of retries on failure.
 * @returns A promise that resolves to the response or null on persistent failure.
 */
export async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: SPOOFED_HEADERS, cache: 'no-store' });
      if (res.ok) {
        return res;
      }
      if (res.status === 429) { // Rate limit
        console.warn(`[MangaDex] Rate limited. Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
      } else {
        // For other errors, log and retry
         console.warn(`[MangaDex] Fetch failed with status ${res.status}. Retrying...`);
         await new Promise(r => setTimeout(r, delay));
      }
    } catch (error) {
      console.error('[MangaDex] Fetch caught exception:', error);
      if (i === retries - 1) return null; // Return null on last retry
       await new Promise(r => setTimeout(r, delay));
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
    const url = `${MANGADEX_API_BASE}/manga/${id}/feed?limit=500&includes[]=scanlation_group&order[chapter]=asc&translatedLanguage[]=en`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    return res.json();
}

export async function fetchImageServerUrl(chapterId: string): Promise<MangaDexImageServer | null> {
    const url = `${MANGADEX_API_BASE}/at-home/server/${chapterId}`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
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
