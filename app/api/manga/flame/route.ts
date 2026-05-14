import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://flamecomics.com/wp-json/wp/v2/posts?per_page=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Flame API error: ${response.status}`);

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Flame returned empty array');
    }

    console.log('✅ FLAME PROXY SUCCESS:', data.length, 'items');

    return NextResponse.json({
      success: true,
      source: 'flame',
      count: data.length,
      data: data.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title?.rendered || 'Unknown Title',
        cover: item.jetpack_featured_media_url || item.featured_media_url || '',
        status: 'ongoing',
        type: 'manhwa',
        source: 'flame'
      }))
    });
  } catch (error) {
    console.error('❌ FLAME PROXY FAILED:', error);
    return NextResponse.json({
      success: false,
      source: 'flame',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
