import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Asura Scans Server-Side Proxy
 * Bypasses CORS and implements caching.
 */
export async function GET() {
  try {
    const response = await fetch('https://asuracomic.net/api/series?cursor=0&limit=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://asuracomic.net/',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Asura API error: ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    console.log('✅ ASURA PROXY SUCCESS:', list.length, 'items');

    return NextResponse.json({
      success: true,
      source: 'asura',
      count: list.length,
      data: list.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title || 'Unknown Title',
        cover: item.thumbnail?.url || item.cover?.url || item.thumbnail || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'manhwa',
        source: 'asura',
        genres: item.genres?.map((g: any) => g.name || g) || []
      }))
    });
  } catch (error) {
    console.error('❌ ASURA PROXY FAILED:', error);
    return NextResponse.json({
      success: false,
      source: 'asura',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
