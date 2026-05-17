import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int, $search: String, $genres: [String]) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, format: MANHWA, sort: POPULARITY_DESC, search: $search, genre_in: $genres) {
      id
      title {
        english
        romaji
      }
      coverImage {
        large
      }
      averageScore
      status
      genres
      description
    }
  }
}
`;

export async function GET() {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: {
          page: 1,
          perPage: 20
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AniList API Error: ${response.status} ${errorBody}`);
    }

    const payload = await response.json();
    const media = payload?.data?.Page?.media;

    if (!Array.isArray(media) || media.length === 0) {
      throw new Error('AniList returned no media entries');
    }

    const normalized = media.map((item: any) => ({
      id: String(item.id),
      title: item.title?.english || item.title?.romaji || 'Unknown Title',
      cover: item.coverImage?.large || '',
      averageScore: typeof item.averageScore === 'number' ? item.averageScore : null,
      status: item.status || 'UNKNOWN',
      genres: Array.isArray(item.genres) ? item.genres : [],
      description: item.description || '',
      source: 'anilist'
    }));

    return NextResponse.json({ success: true, data: normalized }, { status: 200, next: { revalidate: 300 } });
  } catch (error: any) {
    console.error('[CATALOG ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch catalog data', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
