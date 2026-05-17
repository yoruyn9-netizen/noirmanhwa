
import { NextResponse } from 'next/server';
import { Chapter } from '@/types/manga';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const mangaId = params.id;

  try {
    const res = await fetch(`https://api.sansekai.my.id/api/komik/${mangaId}/chapters`, {
      next: { revalidate: 300 },
    });

    const sansekaiData = await res.json();

    if (sansekaiData.retcode !== 0) {
      return NextResponse.json({ success: false, data: [], error: 'API Error' }, { status: 200 });
    }

    const mappedData: Chapter[] = sansekaiData.data.map((chapter: any) => ({
      id: chapter.id,
      mangaId: mangaId,
      number: chapter.chapter,
      title: chapter.title,
      source: 'unknown',
      publishAt: chapter.release_date,
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], error: 'Failed to fetch data' }, { status: 200 });
  }
}
