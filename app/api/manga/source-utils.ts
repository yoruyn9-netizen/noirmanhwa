const TIMEOUT_MS = 10000;

function createTimeoutSignal() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, timeout };
}

export async function getMangaDexData() {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const endpoint = 'https://api.mangadex.org/manga';
    const params = new URLSearchParams();
    params.append('limit', '50');
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('order[latestUploadedChapter]', 'desc');
    params.append('contentRating', 'safe');
    params.append('order[rating]', 'desc');

    const response = await fetch(`${endpoint}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      },
      signal: controller.signal,
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`MangaDex API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No manga data from MangaDex');
    }

    return {
      success: true,
      source: 'mangadex',
      data: data.data.map((item: any) => {
        const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
        const coverUrl = coverRel?.attributes?.fileName
          ? `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}`
          : '';

        const titles = item.attributes?.title || {};
        const enTitle = titles.en || Object.values(titles)[0] || 'Unknown Title';

        return {
          id: item.id,
          title: String(enTitle).toUpperCase().substring(0, 50),
          cover: coverUrl,
          status: item.attributes?.status?.toLowerCase() || 'ongoing',
          type: 'MANGA',
          source: 'mangadex',
          genres: item.attributes?.tags
            ?.filter((t: any) => t.attributes?.category === 'genre')
            ?.map((t: any) => t.attributes?.name?.en || t.attributes?.name)
            || [],
          year: item.attributes?.year,
          rating: item.attributes?.rating?.bayesianMeanRating || null,
          updatedAt: item.attributes?.updatedAt
        };
      })
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('MangaDex request timed out after 10 seconds');
    }
    console.error('❌ [MANGADEX PROXY ERROR]:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getAsuraData() {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const endpoint = 'https://asuracomic.net/api/series?cursor=0&limit=50';

    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Referer: 'https://asuracomic.net/',
        Origin: 'https://asuracomic.net',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      signal: controller.signal,
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      throw new Error(`Asura API Error: ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.series || data.data || [];

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('No series data from Asura');
    }

    return {
      success: true,
      source: 'asura',
      data: list.map((item: any) => ({
        id: item.slug || item.id,
        title: (item.title || 'Signal Lost').toUpperCase().substring(0, 50),
        cover: item.thumbnail?.url || item.cover?.url || item.image || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'MANHWA',
        source: 'asura',
        genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name || g) : [],
        updatedAt: item.updatedAt || item.last_chapter_at
      }))
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Asura request timed out after 10 seconds');
    }
    console.error('❌ [ASURA PROXY ERROR]:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getFlameData() {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const response = await fetch('https://flamecomics.com/wp-json/wp/v2/posts?per_page=24&_embed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Referer: 'https://flamecomics.com/',
        Origin: 'https://flamecomics.com',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Flame API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No posts data from Flame');
    }

    return {
      success: true,
      source: 'flame',
      data: data.map((item: any) => ({
        id: item.slug || item.id,
        title: (item.title?.rendered || 'Unknown Frequency').toUpperCase().substring(0, 50),
        cover: item.jetpack_featured_media_url || item.featured_media_url || '',
        status: 'ongoing',
        type: 'MANHWA',
        source: 'flame',
        genres: [],
        updatedAt: item.modified
      }))
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Flame request timed out after 10 seconds');
    }
    console.error('❌ [FLAME PROXY]:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
