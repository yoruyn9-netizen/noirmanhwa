
import { NextResponse } from 'next/server';
import { getChapterImageUrls } from '@/src/lib/mangadex';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');

  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
  }

  try {
    const imageUrls = await getChapterImageUrls(chapterId);
    return NextResponse.json(imageUrls);
  } catch (error: any) {
    // If fetching fails, we can return a cached error response
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
