
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Direct Flame Scans Logic
 * Optimized for WordPress REST API discovery.
 * THROWS ERROR on failure instead of returning empty array.
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
  } catch (error) {
    console.error('❌ [FLAME PROXY]:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await getFlameData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [FLAME GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Flame data',
      data: []
    }, { status: 503 });
  }
}

