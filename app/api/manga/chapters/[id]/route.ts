import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Manga ID is required', data: [] }, { status: 400 });
  }

  const limit = 10;
  let offset = 0;
  let total = 0;
  const chapters: any[] = [];

  try {
    do {
      const url = `https://api.mangadex.org/manga/${id}/feed?limit=${limit}&offset=${offset}&order[chapter]=asc`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`MangaDex feed error: ${response.status} ${errorBody}`);
      }

      const payload = await response.json();
      const pageItems = Array.isArray(payload?.data) ? payload.data : [];

      if (pageItems.length === 0) break;

      const normalized = pageItems.map((item: any) => ({
        id: item.id,
        mangaId: id,
        number: item.attributes?.chapter || item.attributes?.title || '0',
        title: item.attributes?.title || `Chapter ${item.attributes?.chapter || '?'}`,
        publishAt: item.attributes?.publishAt || null,
        source: 'mangadex'
      }));

      chapters.push(...normalized);
      total = typeof payload.total === 'number' ? payload.total : chapters.length;
      offset += pageItems.length;
    } while (offset < total && offset < 100);

    return NextResponse.json({ success: true, data: chapters }, { status: 200, next: { revalidate: 300 } });
  } catch (error: any) {
    console.error('[CHAPTERS ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chapters', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
