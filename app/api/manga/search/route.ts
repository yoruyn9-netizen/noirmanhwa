
import { NextResponse } from 'next/server';
import { Manga } from '@/types/manga';

const MANGADEX_BASE = 'https://api.mangadex.org';
const MANGADEX_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Referer: 'https://mangadex.org/',
  Origin: 'https://mangadex.org'
};

function normalizeTitle(titleObj: Record<string, string> = {}) {
  return titleObj.en || titleObj['ja-ro'] || Object.values(titleObj)[0] || 'Unknown Title';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const params = new URLSearchParams();
  params.append('limit', '24');
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');
  params.append('contentRating[]', 'safe');
  params.append('contentRating[]', 'suggestive');
  params.append('order[followedCount]', 'desc');
  params.append('originalLanguage[]', 'ja');
  params.append('originalLanguage[]', 'ko');
  params.append('originalLanguage[]', 'zh');
  if (query) {
    params.append('title', query);
  }

  try {
    const response = await fetch(`${MANGADEX_BASE}/manga?${params.toString()}`, {
      headers: MANGADEX_HEADERS,
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const payload = await response.json();
    const mangaItems = Array.isArray(payload?.data) ? payload.data : [];

    const mappedData: Manga[] = mangaItems.map((manga: any) => {
      const coverRel = Array.isArray(manga.relationships)
        ? manga.relationships.find((rel: any) => rel.type === 'cover_art')
        : null;
      const cover = coverRel?.attributes?.fileName
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`
        : '';
      const genres = Array.isArray(manga.attributes?.tags)
        ? manga.attributes.tags
            .filter((tag: any) => tag.attributes?.category === 'genre')
            .map((tag: any) => tag.attributes?.name?.en || tag.attributes?.name)
            .filter(Boolean)
        : [];

      return {
        id: manga.id,
        title: normalizeTitle(manga.attributes?.title),
        cover,
        status: manga.attributes?.status || 'unknown',
        genres,
        source: 'mangadex',
        rating: null,
        type: 'MANGA',
        updatedAt: manga.attributes?.updatedAt || null
      };
    });

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('[API /api/manga/search] MangaDex search failed:', error);
    return NextResponse.json([], { status: 500 });
  }
}
