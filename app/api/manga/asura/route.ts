
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function getAsuraData() {
  try {
    const response = await fetch('https://asuracomic.net/api/series?cursor=0&limit=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://asuracomic.net/',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Source Status: ${response.status}`);

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || []);
    
    if (list.length === 0) return { success: false, data: [] };

    return {
      success: true,
      source: 'asura',
      data: list.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title,
        cover: item.thumbnail?.url || item.cover?.url || item.image || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'MANHWA',
        source: 'asura',
        genres: item.genres?.map((g: any) => g.name || g) || []
      }))
    };
  } catch (error) {
    console.error('❌ [ASURA PROXY]:', error);
    return { success: false, data: [] };
  }
}

export async function GET() {
  const result = await getAsuraData();
  return NextResponse.json(result);
}
