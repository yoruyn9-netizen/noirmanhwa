
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Direct Flame Scans Logic
 * Optimized for WordPress REST API discovery.
 */
export async function getFlameData() {
  try {
    const response = await fetch('https://flamecomics.com/wp-json/wp/v2/posts?per_page=24&_embed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Source Node Status: ${response.status}`);

    const data = await response.json();
    
    return {
      success: true,
      source: 'flame',
      data: data.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title?.rendered || 'Unknown Frequency',
        cover: item.jetpack_featured_media_url || item.featured_media_url || '',
        status: 'ongoing',
        type: 'MANHWA',
        source: 'flame',
        genres: []
      }))
    };
  } catch (error) {
    console.error('❌ [FLAME PROXY]:', error);
    return { success: false, data: [] };
  }
}

export async function GET() {
  const result = await getFlameData();
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
