
import { NextResponse } from 'next/server';
import { getChapterFeed } from '@/lib/mangadex';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Manga ID is required' }, { status: 400 });
  }

  try {
    const chapters = await getChapterFeed(id);
    return NextResponse.json(chapters);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
