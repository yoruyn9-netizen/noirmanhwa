import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Direct Asura Scans Discovery Logic
 * Exported for internal matrix use and standard route handling.
 */
export async function getAsuraData() {
  const startTime = Date.now();
  try {
    // Primary path: latest series discovery
    const endpoint = 'https://asuracomic.net/api/series?cursor=0&limit=50';
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://asuracomic.net/',
        'Origin': 'https://asuracomic.net',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    return {
      success: true,
      source: 'asura',
      count: list.length,
      data: list.map((item: any, idx: number) => ({
        id: item.slug || item.id || `asura-node-${idx}`,
        title: item.title || 'Unknown Title',
        cover: item.thumbnail?.url || item.cover?.url || item.thumbnail || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'manhwa',
        source: 'asura',
        genres: item.genres?.map((g: any) => g.name || g) || []
      }))
    };
  } catch (error) {
    console.error('❌ [ASURA LOGIC] Failed:', error);
    return { success: false, source: 'asura', data: [], count: 0 };
  }
}

export async function GET() {
  const result = await getAsuraData();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
