/**
 * Direct MangaDex API Wrapper - Optimized for Manhwa/Manga/Manhua only.
 * Intelligent Environment Switching: 
 * - Server: Direct fast fetch
 * - Client: Proxied fetch to bypass CORS
 * - Language: Prioritizes Indonesian (id) and English (en)
 */

const MANGADEX_BASE = 'https://api.mangadex.org';
const NOVEL_TAG_ID = '107fd519-ad95-4296-bd74-3232824da344';

const isClient = typeof window !== 'undefined';

async function fetchMangaDex(endpoint: string, options: RequestInit = {}) {
  const url = isClient ? endpoint : `${MANGADEX_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) return { error: true, status: res.status };
    return res.json();
  } catch (error) {
    return { error: true, message: 'Connection failed' };
  }
}

function getStrictFilterParams() {
  const params = new URLSearchParams();
  params.append('excludedTags[]', NOVEL_TAG_ID); // Strict Novel Exclusion
  params.append('contentRating[]', 'safe');
  params.append('contentRating[]', 'suggestive');
  return params;
}

export const mangaApi = {
  getTrending: async () => {
    if (isClient) return fetch('/api/manga?type=trending').then(res => res.json());
    
    const params = getStrictFilterParams();
    params.append('limit', '12');
    params.append('includes[]', 'cover_art');
    params.append('order[followedCount]', 'desc');
    params.append('originalLanguage[]', 'ja');
    params.append('originalLanguage[]', 'ko');
    params.append('originalLanguage[]', 'zh');
    
    return fetchMangaDex(`/manga?${params.toString()}`, { next: { revalidate: 3600 } });
  },

  getLatest: async (offset = 0) => {
    if (isClient) return fetch(`/api/manga?type=latest&offset=${offset}`).then(res => res.json());

    const params = getStrictFilterParams();
    params.append('limit', '24');
    params.append('offset', offset.toString());
    params.append('includes[]', 'cover_art');
    params.append('order[latestUploadedChapter]', 'desc');
    params.append('originalLanguage[]', 'ja');
    params.append('originalLanguage[]', 'ko');
    params.append('originalLanguage[]', 'zh');
    
    return fetchMangaDex(`/manga?${params.toString()}`, { next: { revalidate: 1800 } });
  },

  getMangaDetails: async (id: string) => {
    if (isClient) return fetch(`/api/manga?type=details&id=${id}`).then(res => res.json());
    return fetchMangaDex(`/manga/${id}?includes[]=cover_art&includes[]=author`, { next: { revalidate: 3600 } });
  },

  getChapters: async (mangaId: string) => {
    if (isClient) return fetch(`/api/manga/${mangaId}/feed`).then(res => res.json());

    // Requesting both Indonesian and English chapters
    const data = await fetchMangaDex(
      `/manga/${mangaId}/feed?translatedLanguage[]=id&translatedLanguage[]=en&order[chapter]=asc&limit=500`,
      { next: { revalidate: 1800 } }
    );
    
    if (data && data.data) {
      data.data.sort((a: any, b: any) => {
        const chapA = parseFloat(a.attributes.chapter) || 0;
        const chapB = parseFloat(b.attributes.chapter) || 0;
        return chapA - chapB;
      });
    }
    return data;
  },

  getAtHomeServer: async (chapterId: string) => {
    if (isClient) return fetch(`/api/at-home/${chapterId}`).then(res => res.json());
    return fetchMangaDex(`/at-home/server/${chapterId}`, { next: { revalidate: 3600 } });
  },

  search: async ({ title, includedTags = [], status = [], languages = [], limit = 24 }: { 
    title?: string; includedTags?: string[]; status?: string[]; languages?: string[]; limit?: number 
  }) => {
    if (isClient) {
      const p = new URLSearchParams();
      p.append('type', 'search');
      if (title) p.append('title', title);
      includedTags.forEach(t => p.append('includedTags[]', t));
      status.forEach(s => p.append('status[]', s));
      languages.forEach(l => p.append('originalLanguage[]', l));
      p.append('limit', limit.toString());
      return fetch(`/api/manga?${p.toString()}`).then(res => res.json());
    }

    const params = getStrictFilterParams();
    params.append('limit', limit.toString());
    params.append('includes[]', 'cover_art');
    if (title) params.append('title', title);
    includedTags.forEach(t => params.append('includedTags[]', t));
    status.forEach(s => params.append('status[]', s));
    languages.forEach(l => params.append('originalLanguage[]', l));
    
    if (languages.length === 0) {
      params.append('originalLanguage[]', 'ja');
      params.append('originalLanguage[]', 'ko');
      params.append('originalLanguage[]', 'zh');
    }
    
    return fetchMangaDex(`/manga?${params.toString()}`, { next: { revalidate: 600 } });
  },

  getTags: async () => {
    if (isClient) return fetch('/api/manga?type=tags').then(res => res.json());
    return fetchMangaDex('/manga/tag');
  }
};
