import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getMangadexIdFromAnilistId(anilistId: string) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        title {
          english
          romaji
          native
        }
      }
    }
  `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables: { id: Number(anilistId) } })
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const title = payload?.data?.Media?.title?.english || payload?.data?.Media?.title?.romaji || payload?.data?.Media?.title?.native;
  if (!title) return null;

  const searchParams = new URLSearchParams({
    title,
    limit: '1',
    'includes[]': 'cover_art'
  });

  const dexResponse = await fetch(`https://api.mangadex.org/manga?${searchParams.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  if (!dexResponse.ok) return null;
  const dexPayload = await dexResponse.json();
  return dexPayload?.data?.[0]?.id || null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Manga ID is required', data: [] }, { status: 400 });
  }

  try {
    let mangadexId = id;
    const isNumeric = /^\\d+$/.test(id);
    if (!isNumeric) {
      const mapped = await getMangadexIdFromAnilistId(id);
      if (!mapped) {
        throw new Error('Unable to resolve MangaDex ID for the provided AniList ID');
      }
      mangadexId = mapped;
    }

    const limit = 50;
    let offset = 0;
    const results: any[] = [];

    while (true) {
      const feedUrl = `https://api.mangadex.org/manga/${mangadexId}/feed?limit=${limit}&offset=${offset}&order[chapter]=asc`;
      const response = await fetch(feedUrl, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`MangaDex feed failed: ${response.status} ${errorBody}`);
      }

      const payload = await response.json();
      const batch = Array.isArray(payload?.data) ? payload.data : [];
      if (batch.length === 0) break;

      const normalized = batch.map((item: any) => ({
        id: item.id,
        mangaId: mangadexId,
        number: item.attributes?.chapter || item.attributes?.title || '0',
        title: item.attributes?.title || `Chapter ${item.attributes?.chapter || '0'}`,
        publishAt: item.attributes?.publishAt || null,
        source: 'mangadex'
      }));

      results.push(...normalized);
      if (batch.length < limit) break;
      offset += batch.length;
    }

    return NextResponse.json({ success: true, data: results }, { status: 200, next: { revalidate: 300 } });
  } catch (error: any) {
    console.error('[CHAPTERS ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chapters', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
