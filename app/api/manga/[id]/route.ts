
import { NextResponse } from 'next/server';
import { Manga, Chapter } from '@/types/manga';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const mangaId = params.id;

  try {
    const [detailRes, chaptersRes] = await Promise.all([
      fetch(`https://api.sansekai.my.id/api/komik/${mangaId}`),
      fetch(`https://api.sansekai.my.id/api/komik/${mangaId}/chapters`),
    ]);

    const [detailData, chaptersData] = await Promise.all([detailRes.json(), chaptersRes.json()]);

    if (detailData.retcode !== 0 || chaptersData.retcode !== 0) {
      return NextResponse.json({ success: false, data: null, error: 'API Error' }, { status: 200 });
    }

    const mangaDetail: Manga = {
      id: detailData.data.id,
      title: detailData.data.title,
      cover: detailData.data.cover_portrait_url || detailData.data.cover_image_url,
      status: detailData.data.status === 1 ? 'ongoing' : 'completed',
      genres: detailData.data.taxonomy.Genre.map((g: any) => g.name),
      source: 'unknown',
      rating: detailData.data.user_rate,
      type: detailData.data.taxonomy.Format[0]?.name || 'MANHWA',
      updatedAt: detailData.data.latest_chapter_time,
      description: detailData.data.description,
      year: detailData.data.year,
    };

    const chapters: Chapter[] = chaptersData.data.map((chapter: any) => ({
      id: chapter.id,
      mangaId: mangaId,
      number: chapter.chapter,
      title: chapter.title,
      source: 'unknown',
      publishAt: chapter.release_date,
    }));

    return NextResponse.json({ ...mangaDetail, chapters });

  } catch (error) {
    return NextResponse.json({ success: false, data: null, error: 'Failed to fetch data' }, { status: 200 });
  }
}
