
import { NextResponse } from 'next/server';
import { getMangaDexData } from '../source-utils';

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, sort: POPULARITY_DESC) {
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

async function trySource(name: string, fn: () => Promise<any>) {
  try {
    const result = await fn();
    if (!result || !Array.isArray(result.data)) {
      console.warn(`❌ [COMBINED] ${name} returned invalid payload.`, { result });
      return { data: [] };
    }

    if (result.data.length === 0) {
      console.warn(`⚠️ [COMBINED] ${name} returned empty data array.`);
      return { data: [] };
    }

    return { data: result.data };
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    console.warn(`❌ [COMBINED] ${name} request failed:`, message);
    return { data: [] };
  }
}

export async function GET() {
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  // First, attempt MangaDex as primary source
  try {
    const md = await getMangaDexData();
    const mdData = Array.isArray(md?.data) ? md.data : [];
    counts.mangadex = mdData.length;

    // If we have at least 20 entries from MangaDex, return them immediately
    if (mdData.length >= 20) {
      return NextResponse.json({ success: true, data: mdData.slice(0, 100), sources: counts, total: mdData.length, timestamp: new Date().toISOString() }, { status: 200 });
    }

    // Otherwise, attempt to supplement with AniList results to reach 20
    const needed = Math.max(0, 20 - mdData.length);
    try {
      const anilistRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: ANILIST_QUERY, variables: { page: 1, perPage: Math.max(20, needed) } })
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

      // Merge MangaDex first, then AniList, dedupe by id+source
      const finalMap = new Map<string, any>();
      mdData.forEach((m: any) => finalMap.set(`${m.id}-${m.source || 'mangadex'}`, m));
      for (const a of anilistNormalized) {
        const key = `${a.id}-${a.source}`;
        if (!finalMap.has(key)) finalMap.set(key, a);
        if (finalMap.size >= 20) break;
      }

      const final = Array.from(finalMap.values()).slice(0, Math.max(20, mdData.length));

      return NextResponse.json({ success: true, data: final, sources: counts, total: final.length, timestamp: new Date().toISOString() }, { status: 200 });
    } catch (anError: any) {
      console.warn('❌ [COMBINED] AniList supplement failed:', anError?.message || anError);
      errors.push(`AniList: ${anError?.message || 'failed'}`);
      // If AniList supplement fails but we have some MangaDex data, return MangaDex (even if <20)
      if (mdData.length > 0) {
        return NextResponse.json({ success: true, data: mdData, sources: counts, total: mdData.length, errors, timestamp: new Date().toISOString() }, { status: 200 });
      }
      // else fall through to error
    }
  } catch (mdError: any) {
    console.warn('❌ [COMBINED] MangaDex primary fetch failed:', mdError?.message || mdError);
    errors.push(`MangaDex: ${mdError?.message || 'failed'}`);
    // Try AniList as fallback
    try {
      const anilistRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: ANILIST_QUERY, variables: { page: 1, perPage: 20 } })
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

      if (anilistNormalized.length === 0) {
        throw new Error('AniList returned no items');
      }

      return NextResponse.json({ success: true, data: anilistNormalized, sources: counts, total: anilistNormalized.length, timestamp: new Date().toISOString() }, { status: 200 });
    } catch (anError: any) {
      console.error('❌ [COMBINED] All sources failed:', { mdError, anError });
      errors.push(`AniList: ${anError?.message || 'failed'}`);
      return NextResponse.json({ success: false, data: [], sources: counts, errors, timestamp: new Date().toISOString() }, { status: 500 });
    }
  }
}
