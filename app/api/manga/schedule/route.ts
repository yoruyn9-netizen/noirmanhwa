
import { NextResponse } from 'next/server';
import { Manga } from '@/types/manga';

export async function GET() {
  try {
    const res = await fetch('https://api.sansekai.my.id/api/komik?type=manhwa&sort=updated&page=1&limit=50', {
      next: { revalidate: 300 },
    });

    const sansekaiData = await res.json();

    if (sansekaiData.retcode !== 0) {
      return NextResponse.json({ success: false, data: [], error: 'API Error' }, { status: 200 });
    }

    const mappedData: Manga[] = sansekaiData.data.map((manga: any) => ({
      id: manga.id,
      title: manga.title,
      cover: manga.cover_portrait_url || manga.cover_image_url,
      status: manga.status === 1 ? 'ongoing' : 'completed',
      genres: manga.taxonomy.Genre.map((g: any) => g.name),
      source: 'unknown',
      rating: manga.user_rate,
      type: manga.taxonomy.Format[0]?.name || 'MANHWA',
      updatedAt: manga.latest_chapter_time,
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], error: 'Failed to fetch data' }, { status: 200 });
  }
}
