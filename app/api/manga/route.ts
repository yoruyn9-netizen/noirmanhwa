
import { NextResponse } from 'next/server';
import { getMangaList, getMangaDetails } from '@/src/lib/mangadex';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const manga = await getMangaDetails(id);
      return NextResponse.json(manga);
    } else {
      const mangaList = await getMangaList();
      return NextResponse.json(mangaList);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
