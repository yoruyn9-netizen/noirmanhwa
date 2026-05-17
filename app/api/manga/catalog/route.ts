
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(
      'https://api.sansekai.my.id/api/komik?type=manhwa&page=1&limit=50',
      { next: { revalidate: 300 } }
    );
    
    const json = await res.json();
    
    if (json.retcode !== 0) {
      return NextResponse.json({ success: false, data: [], error: json.message }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      data: json.data.map((m: any) => ({
        id: m.manga_id,
        title: m.title.toUpperCase(),
        cover: m.cover_portrait_url || m.cover_image_url,
        status: m.status === 1 ? 'ongoing' : 'completed',
        type: m.taxonomy?.Format?.[0]?.name || 'MANHWA',
        source: 'sansekai',
        rating: m.user_rate,
        genres: m.taxonomy?.Genre?.map((g: any) => g.name) || [],
        latestChapter: m.latest_chapter_number,
        updatedAt: m.latest_chapter_time,
        views: m.view_count
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 200 });
  }
}
