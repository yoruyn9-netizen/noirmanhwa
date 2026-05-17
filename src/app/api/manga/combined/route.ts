
import { NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

export const dynamic = 'force-dynamic';

function getCoverUrl(manga: any) {
  const coverRel = Array.isArray(manga.relationships)
    ? manga.relationships.find((rel: any) => rel.type === 'cover_art')
    : null;
  const fileName = coverRel?.attributes?.fileName;
  if (!fileName) return '';
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg`;
}

export async function GET() {
  try {
    const response = await fetch(
      `${MANGADEX_BASE}/manga?limit=100&includes[]=cover_art&includes[]=author&order[latestUploadedChapter]=desc&contentRating[]=safe&originalLanguage[]=ko&originalLanguage[]=ja&originalLanguage[]=zh`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MangaDex error ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.data) ? payload.data : [];

    const mangaList = results.map((item: any) => ({
      id: item.id,
      title: item.attributes?.title?.en || item.attributes?.title?.en_jp || Object.values(item.attributes?.title || {})?.[0] || 'Unknown Title',
      cover: getCoverUrl(item),
      status: item.attributes?.status || 'ongoing',
      type: item.attributes?.publicationDemographic || 'manhwa',
      source: 'mangadex',
      genres: Array.isArray(item.attributes?.tags)
        ? item.attributes.tags.map((tag: any) => tag.attributes?.name?.en || 'Unknown')
        : [],
      rating: null,
      description: item.attributes?.description?.en || '',
      language: item.attributes?.originalLanguage || 'unknown',
      year: item.attributes?.year || null,
      updatedAt: item.attributes?.updatedAt || null
    }));

    return NextResponse.json(
      { success: true, data: mangaList.slice(0, 100), total: mangaList.length },
      { status: 200, next: { revalidate: 300 } }
    );
  } catch (error: any) {
    console.error('[COMBINED ROUTE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch combined manga data', data: [] },
      { status: 500, next: { revalidate: 300 } }
    );
  }
}
