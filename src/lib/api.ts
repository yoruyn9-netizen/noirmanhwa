
/**
 * Simple Direct MangaDex API Wrapper
 */

const MANGADEX_BASE = 'https://api.mangadex.org';

export const mangaApi = {
  getTrending: async () => {
    console.log('[API] Fetching Trending Manga');
    const res = await fetch(`${MANGADEX_BASE}/manga?limit=10&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`, {
      next: { revalidate: 3600 }
    });
    return res.json();
  },

  getLatest: async (offset = 0) => {
    console.log(`[API] Fetching Latest Manga (Offset: ${offset})`);
    const res = await fetch(`${MANGADEX_BASE}/manga?limit=24&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe`, {
      next: { revalidate: 1800 }
    });
    return res.json();
  },

  getMangaDetails: async (id: string) => {
    console.log(`[API] Fetching Details for: ${id}`);
    const res = await fetch(`${MANGADEX_BASE}/manga/${id}?includes[]=cover_art&includes[]=author`, {
      next: { revalidate: 3600 }
    });
    return res.json();
  },

  getChapters: async (mangaId: string) => {
    console.log(`[API] Fetching Chapters for: ${mangaId}`);
    const res = await fetch(
      `${MANGADEX_BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&translatedLanguage[]=id&order[chapter]=asc&order[volume]=asc&limit=500`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    
    // Manual sort to ensure numerical accuracy
    if (data.data) {
      data.data.sort((a: any, b: any) => {
        const chapA = parseFloat(a.attributes.chapter) || 0;
        const chapB = parseFloat(b.attributes.chapter) || 0;
        return chapA - chapB;
      });
    }
    return data;
  },

  getAtHomeServer: async (chapterId: string) => {
    console.log(`[API] Fetching At-Home Server for Chapter: ${chapterId}`);
    const res = await fetch(`${MANGADEX_BASE}/at-home/server/${chapterId}`, {
      next: { revalidate: 3600 }
    });
    return res.json();
  },

  search: async (title: string, tags: string[] = [], status: string[] = []) => {
    console.log(`[API] Searching: "${title}" with Tags: ${tags.join(',')}`);
    const params = new URLSearchParams({
      limit: '24',
      includes: 'cover_art',
    });
    if (title) params.append('title', title);
    tags.forEach(t => params.append('includedTags[]', t));
    status.forEach(s => params.append('status[]', s));
    
    const res = await fetch(`${MANGADEX_BASE}/manga?${params.toString()}`, {
      next: { revalidate: 600 }
    });
    return res.json();
  },

  getTags: async () => {
    const res = await fetch(`${MANGADEX_BASE}/manga/tag`);
    return res.json();
  }
};
