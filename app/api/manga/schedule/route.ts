import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/manga?type=manhwa&filter=airing&limit=20', {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Jikan API Error: ${response.status} ${errorBody}`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];

    const schedule = items.map((item: any) => ({
      id: item.mal_id ? String(item.mal_id) : item.url,
      title: item.title || 'Untitled',
      imageUrl: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || '',
      publishedFrom: item.published?.from || null,
      publishedTo: item.published?.to || null,
      score: typeof item.score === 'number' ? item.score : null,
      members: typeof item.members === 'number' ? item.members : null,
      url: item.url || '',
      chapters: typeof item.chapters === 'number' ? item.chapters : null,
      status: 'AIRING'
    }));

    return NextResponse.json({ success: true, data: schedule }, { status: 200, next: { revalidate: 300 } });
  } catch (error: any) {
    console.error('[SCHEDULE ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch schedule', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
