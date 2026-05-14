import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://asuracomic.net/api/series?cursor=0&limit=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Asura API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Asura returned empty array');
    }

    console.log('✅ ASURA PROXY SUCCESS:', data.length, 'items');

    return NextResponse.json({
      success: true,
      source: 'asura',
      count: data.length,
      data: data.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title || 'Unknown Title',
        cover: item.thumbnail?.url || item.cover?.url || item.image || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'manhwa',
        source: 'asura'
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
