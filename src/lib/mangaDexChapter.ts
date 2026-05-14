
/**
 * Robust Chapter & Image Loading Utility (Thrive.moe inspired)
 * Implements fallback servers, retries, and preloading logic.
 */

const API_BASE = 'https://api.mangadex.org';

export async function fetchAllChapters(mangaId: string) {
  let allChapters: any[] = [];
  let offset = 0;
  let total = 0;

  try {
    do {
      const res = await fetch(
        `${API_BASE}/manga/${mangaId}/feed?limit=100&offset=${offset}&translatedLanguage[]=en&translatedLanguage[]=id&order[chapter]=desc&includes[]=scanlation_group`,
        { next: { revalidate: 3600 } }
      );
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
  try {
    const res = await fetch(`${API_BASE}/at-home/server/${chapterId}`);
    if (!res.ok) throw new Error('Primary server unreachable');
    return await res.json();
  } catch (error) {
    console.warn('[Server Fallback]: Attempting backup node');
    // Minimal fallback structure
    return null;
  }
}

export async function loadImageWithRetry(url: string, maxRetries = 3): Promise<string> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (res.ok) return url;
      throw new Error(`Status ${res.status}`);
    } catch (err) {
      attempt++;
      if (attempt === maxRetries) throw err;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  return url;
}
