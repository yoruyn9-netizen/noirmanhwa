import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMangaList,
  fetchMangaDetail,
  constructCoverUrl,
  getDisplayTitle,
  MangaDexManga
} from '@/lib/mangadex';
import { Manga } from '@/lib/types'; // Assuming this is your existing type

export const dynamic = 'force-dynamic';
export const revalidate = 300;

// This is a placeholder for your existing cache mechanism.
// In a real scenario, you'd use Redis, an in-memory cache, or Next.js's data cache.
let mangaListCache: { data: MangaDexManga[], timestamp: number } | null = null;
const CACHE_DURATION = 300 * 1000; // 5 minutes, matching revalidate

const adaptManga = (mdManga: MangaDexManga): Manga => ({
    id: mdManga.id,
    title: getDisplayTitle(mdManga),
    coverUrl: constructCoverUrl(mdManga, '.512.jpg'),
    description: mdManga.attributes.description?.en || 'No description available.',
    status: mdManga.attributes.status,
    tags: mdManga.attributes.tags.map(tag => tag.attributes.name.en).filter(Boolean),
    author: mdManga.relationships.find(r => r.type === 'author')?.attributes?.name || 'Unknown',
    year: mdManga.attributes.year,
    // Add any other fields your UI needs
    source: 'mangadex', // identify the source
    chapters: [], // This would be populated by a different call
});


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Fetching a single manga detail
      const mangaData = await fetchMangaDetail(id);
      if (!mangaData || !mangaData.data) {
          return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
      }
      const adaptedManga = adaptManga(mangaData.data);
      return NextResponse.json(adaptedManga);
    } else {
      // Fetching the list of manga
      const currentTime = Date.now();
      if (mangaListCache && (currentTime - mangaListCache.timestamp < CACHE_DURATION)) {
        // Return from cache if valid
        const adaptedList = mangaListCache.data.map(adaptManga);
        return NextResponse.json(adaptedList);
      }

      const mangaListData = await fetchMangaList();
      if (!mangaListData || !mangaListData.data) {
        // On error, try to return stale cache if it exists
        if (mangaListCache) {
             console.warn('[API] Failed to fetch new manga list, serving stale cache.');
             const adaptedList = mangaListCache.data.map(adaptManga);
             return NextResponse.json(adaptedList);
        }
        return NextResponse.json({ error: 'Failed to fetch manga list' }, { status: 500 });
      }
      
      // Update cache
      mangaListCache = { data: mangaListData.data, timestamp: Date.now() };
      const adaptedList = mangaListData.data.map(adaptManga);
      return NextResponse.json(adaptedList);
    }
  } catch (error) {
    console.error('[API /api/manga]', error);
    // On caught exception, still try to serve stale cache
     if (!id && mangaListCache) {
        console.warn('[API] Exception caught, serving stale manga list cache.');
        const adaptedList = mangaListCache.data.map(adaptManga);
        return NextResponse.json(adaptedList);
     }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
