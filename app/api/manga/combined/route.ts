import { NextResponse } from 'next/server';
import { getMangaDexData } from '../source-utils';

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int, $search: String, $genres: [String]) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, sort: POPULARITY_DESC, search: $search, genre_in: $genres) {
      id
      title { english romaji }
      coverImage { large }
      averageScore
      status
      genres
      description
    }
  }
}
`;

export const dynamic = 'force-dynamic';

function applyFilters(items: any[], query: string, genres: string[], sort: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedGenres = genres.map((item) => item.trim().toLowerCase()).filter(Boolean);

  const filtered = items.filter((item: any) => {
    const title = String(item.title || '').toLowerCase();
    const genreMatch = normalizedGenres.length
      ? Array.isArray(item.genres) && item.genres.some((genre: string) => normalizedGenres.includes(genre.toLowerCase()))
      : true;
    const searchMatch = normalizedQuery ? title.includes(normalizedQuery) : true;
    return genreMatch && searchMatch;
  });

  return filtered.sort((a: any, b: any) => {
    if (sort === 'latest') {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    }
    if (sort === 'rating') {
      const aRating = typeof a.rating === 'number' ? a.rating : -1;
      const bRating = typeof b.rating === 'number' ? b.rating : -1;
      return bRating - aRating;
    }
    if (sort === 'az') {
      return String(a.title || '').localeCompare(String(b.title || ''));
    }
    return 0;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';
  const genres = url.searchParams.getAll('genres');
  const sort = url.searchParams.get('sort') || 'popular';

  const counts: Record<string, number> = {};
  const errors: string[] = [];

  try {
    const md = await getMangaDexData();
    const mdData = Array.isArray(md?.data) ? md.data : [];
    counts.mangadex = mdData.length;

    let mergedItems = [...mdData];
    const shouldFetchAniList = mdData.length < 50 || Boolean(search) || genres.length > 0;

    if (shouldFetchAniList) {
      try {
        const anilistRes = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ query: ANILIST_QUERY, variables: { page: 1, perPage: 50, search, genres: genres.length ? genres : null } })
        });

        if (!anilistRes.ok) {
          const body = await anilistRes.text().catch(() => '');
          throw new Error(`AniList request failed: ${anilistRes.status} ${body}`);
        }

        const payload = await anilistRes.json();
        const media = payload?.data?.Page?.media || [];
        const anilistNormalized = Array.isArray(media)
          ? media.map((item: any) => ({
              id: String(item.id),
              title: item.title?.english || item.title?.romaji || 'Unknown Title',
              cover: item.coverImage?.large || '',
              averageScore: typeof item.averageScore === 'number' ? item.averageScore : null,
              status: item.status || 'UNKNOWN',
              genres: Array.isArray(item.genres) ? item.genres : [],
              description: item.description || '',
              source: 'anilist'
            }))
          : [];

        counts.anilist = anilistNormalized.length;

        const finalMap = new Map<string, any>();
        mergedItems.forEach((item) => finalMap.set(`${item.id}-${item.source || 'mangadex'}`, item));
        for (const item of anilistNormalized) {
          const key = `${item.id}-${item.source}`;
          if (!finalMap.has(key)) {
            finalMap.set(key, item);
          }
        }

        mergedItems = Array.from(finalMap.values());
      } catch (anError: any) {
        console.warn('❌ [COMBINED] AniList supplement failed:', anError?.message || anError);
        errors.push(`AniList: ${anError?.message || 'failed'}`);
      }
    }

    const finalItems = applyFilters(mergedItems, search, genres, sort).slice(0, 50);
    return NextResponse.json(
      { success: true, data: finalItems, sources: counts, total: finalItems.length, errors, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (mdError: any) {
    console.warn('❌ [COMBINED] MangaDex primary fetch failed:', mdError?.message || mdError);
    errors.push(`MangaDex: ${mdError?.message || 'failed'}`);

    try {
      const anilistRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: ANILIST_QUERY, variables: { page: 1, perPage: 50, search, genres: genres.length ? genres : null } })
      });

      if (!anilistRes.ok) {
        const body = await anilistRes.text().catch(() => '');
        throw new Error(`AniList request failed: ${anilistRes.status} ${body}`);
      }

      const payload = await anilistRes.json();
      const media = payload?.data?.Page?.media || [];
      const anilistNormalized = Array.isArray(media)
        ? media.map((item: any) => ({
            id: String(item.id),
            title: item.title?.english || item.title?.romaji || 'Unknown Title',
            cover: item.coverImage?.large || '',
            averageScore: typeof item.averageScore === 'number' ? item.averageScore : null,
            status: item.status || 'UNKNOWN',
            genres: Array.isArray(item.genres) ? item.genres : [],
            description: item.description || '',
            source: 'anilist'
          }))
        : [];

      counts.anilist = anilistNormalized.length;
      const finalItems = applyFilters(anilistNormalized, search, genres, sort).slice(0, 50);
      return NextResponse.json(
        { success: true, data: finalItems, sources: counts, total: finalItems.length, errors, timestamp: new Date().toISOString() },
        { status: 200 }
      );
    } catch (anError: any) {
      console.error('❌ [COMBINED] All sources failed:', { mdError, anError });
      errors.push(`AniList: ${anError?.message || 'failed'}`);
      return NextResponse.json({ success: false, data: [], sources: counts, errors, timestamp: new Date().toISOString() }, { status: 500 });
    }
  }
}
