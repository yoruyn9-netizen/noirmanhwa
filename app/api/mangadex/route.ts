import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * MangaDex API Proxy
 * Fetches real manga data from official MangaDex API
 */
export async function getMangaDexData() {
  try {
    const endpoint = 'https://api.mangadex.org/manga';
    const params = new URLSearchParams({
      limit: '20',
      'includes[]': 'cover_art',
      'includes[]': 'author',
      'order[latestUploadedChapter]': 'desc',
      contentRating: 'safe',
      'order[rating]': 'desc'
    });

    const response = await fetch(`${endpoint}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      console.warn(`[MANGADEX]: Source node responded with ${response.status}`);
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
        // Find cover URL from relationships
        const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
        const coverUrl = coverRel?.attributes?.fileName 
          ? `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}`
          : '';

        // Get English title
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
  } catch (error) {
    console.error('❌ [MANGADEX PROXY ERROR]:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await getMangaDexData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [MANGADEX GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch MangaDex data',
      data: []
    }, { status: 503 });
  }
}
