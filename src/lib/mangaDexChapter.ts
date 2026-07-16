
/**
 * Robust Chapter & Image Loading Utility (Thrive.moe inspired)
 * Implements fallback servers, retries, and preloading logic.
 */

const API_BASE = 'https://api.mangadex.org';

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangadex.org/',
  'Origin': 'https://mangadex.org'
};

async function fetchJsonWithRetry(url: string, retries = 4, delay = 1200) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: DEFAULT_HEADERS, cache: 'no-store' });
      if (res.ok) {
        return res;
      }

      if (res.status === 429 || res.status >= 500) {
        const wait = delay * Math.pow(2, attempt);
        console.warn(`[MangaDex Chapter] Retrying ${url} (${attempt + 1}/${retries}) after ${wait}ms because status ${res.status}`);
        await new Promise((resolve) => setTimeout(resolve, wait));
        continue;
      }

      console.warn(`[MangaDex Chapter] Non-retriable status ${res.status} for ${url}`);
      return res;
    } catch (error) {
      if (attempt >= retries - 1) {
        console.error(`[MangaDex Chapter] Failed permanently for ${url}:`, error);
        return null;
      }
      const wait = delay * Math.pow(2, attempt);
      console.warn(`[MangaDex Chapter] Fetch exception for ${url}. Retrying in ${wait}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  return null;
}

export async function fetchAllChapters(mangaId: string) {
  let allChapters: any[] = [];
  let offset = 0;
  let total = 0;

  try {
    do {
      const res = await fetchJsonWithRetry(
        `${API_BASE}/manga/${mangaId}/feed?limit=100&offset=${offset}&translatedLanguage[]=en&translatedLanguage[]=id&order[chapter]=desc&includes[]=scanlation_group`
      );
      if (!res || !res.ok) {
        console.warn(`[Chapter Sync Error] Failed to fetch feed for ${mangaId}: ${res?.status || 'no response'}`);
        break;
      }

      const data = await res.json();
      if (data.data) {
        allChapters = [...allChapters, ...data.data];
        total = data.total;
        offset += 100;
      } else {
        break;
      }
    } while (offset < total);

    return allChapters;
  } catch (error) {
    console.error('[Chapter Sync Error]:', error);
    return [];
  }
}

export async function getChapterServer(chapterId: string) {
  const isBrowser = typeof window !== 'undefined';
  const endpoint = isBrowser
    ? `/api/at-home/${chapterId}`
    : `${API_BASE}/at-home/server/${chapterId}`;
  const res = await fetchJsonWithRetry(endpoint);
  if (!res || !res.ok) {
    console.warn(`[Server Fallback] At-home server request failed for ${chapterId}: ${res?.status || 'no response'}`);
    return null;
  }

  try {
    return await res.json();
  } catch (error) {
    console.error('[Server Fallback] Invalid JSON from at-home server:', error);
    return null;
  }
}

export async function loadImageWithRetry(url: string, maxRetries = 3): Promise<string> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(url, { signal: controller.signal, headers: DEFAULT_HEADERS });
      clearTimeout(timeout);
      
      if (res.ok) return url;
      throw new Error(`Status ${res.status}`);
    } catch (err) {
      attempt++;
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  return url;
}
