import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, format: MANHWA, sort: POPULARITY_DESC) {
      id
      idMal
      title {
        english
        romaji
        native
      }
      description
      coverImage {
        large
        medium
      }
      averageScore
      status
      genres
    }
  }
}
`;

async function searchMangaDexByTitle(title: string) {
  const query = new URLSearchParams({
    title,
    limit: '1',
    'includes[]': 'cover_art'
  });

  const response = await fetch(`https://api.mangadex.org/manga?${query.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const entry = payload?.data?.[0];
  if (!entry) return null;

  const coverRel = entry.relationships?.find((rel: any) => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;

  return {
    id: entry.id,
    cover: fileName ? `https://uploads.mangadex.org/covers/${entry.id}/${fileName}.512.jpg` : '',
    status: entry.attributes?.status || 'unknown',
    year: entry.attributes?.year || null,
    source: 'mangadex'
  };
}

export async function GET() {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query: ANILIST_QUERY, variables: { page: 1, perPage: 20 } })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AniList request failed: ${response.status} ${errorBody}`);
    }

    const payload = await response.json();
    const media = payload?.data?.Page?.media;
    if (!Array.isArray(media)) {
      throw new Error('AniList returned invalid response');
    }

    const catalog = await Promise.all(
      media.map(async (item: any) => {
        const matchedDex = await searchMangaDexByTitle(item.title.english || item.title.romaji || item.title.native || '');
        return {
          id: matchedDex?.id || String(item.id),
          title: item.title?.english || item.title?.romaji || item.title?.native || 'Unknown Title',
          cover: matchedDex?.cover || item.coverImage?.large || item.coverImage?.medium || '',
          status: item.status || 'UNKNOWN',
          genres: Array.isArray(item.genres) ? item.genres : [],
          averageScore: typeof item.averageScore === 'number' ? item.averageScore : null,
          description: item.description || '',
          anilistId: item.id,
          malId: item.idMal || null,
          source: 'anilist'
        };
      })
    );

    return NextResponse.json({ success: true, data: catalog }, { status: 200, next: { revalidate: 300 } });
  } catch (error: any) {
    console.error('[CATALOG ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch AniList catalog', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
