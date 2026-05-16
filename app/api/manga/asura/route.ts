
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Hardened Asura Scans Discovery Logic
 * Uses high-fidelity browser headers and stealth parameters.
 * THROWS ERROR on failure instead of returning empty array.
 */
export async function getAsuraData() {
  try {
    // Standardizing on the latest functional API endpoint
    const endpoint = 'https://asuracomic.net/api/series?cursor=0&limit=50';
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://asuracomic.net/',
        'Origin': 'https://asuracomic.net',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      throw new Error(`Asura API Error: ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    if (list.length === 0) {
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
  } catch (error) {
    console.error('❌ [ASURA PROXY ERROR]:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await getAsuraData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [ASURA GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Asura data',
      data: []
    }, { status: 503 });
  }
}

