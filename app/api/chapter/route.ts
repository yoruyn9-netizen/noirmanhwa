import { NextRequest, NextResponse } from 'next/server';
import {
  fetchChapters,
  sortChapters,
  MangaDexChapter,
} from '@/lib/mangadex';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

// This type definition is for the UI. It will be centralized in api-adapter.ts
interface ChapterItem {
  id: string;
  title: string;
  chapterNumber: string | null;
  pages: number;
  publishAt: string;
  scanlationGroup: string;
}

// This function adapts the MangaDex API response to our UI's data structure.
// It will be centralized in api-adapter.ts
const adaptChapter = (mdChapter: MangaDexChapter): ChapterItem => ({
  id: mdChapter.id,
  title: mdChapter.attributes.title || `Chapter ${mdChapter.attributes.chapter || ''}`.trim(),
  chapterNumber: mdChapter.attributes.chapter,
  pages: mdChapter.attributes.pages,
  publishAt: mdChapter.attributes.publishAt,
  scanlationGroup: mdChapter.relationships.find(r => r.type === 'scanlation_group')?.attributes?.name || 'Unknown Group',
});


// In-memory cache for chapter lists
const chapterCache = new Map<string, { data: MangaDexChapter[], timestamp: number }>();
const CACHE_DURATION = 300 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Manga ID is required' }, { status: 400 });
  }

  try {
    const currentTime = Date.now();
    const cachedEntry = chapterCache.get(id);

    // Attempt to serve from cache first
    if (cachedEntry && (currentTime - cachedEntry.timestamp < CACHE_DURATION)) {
      const adaptedChapters = cachedEntry.data.map(adaptChapter);
      return NextResponse.json(adaptedChapters);
    }

    const chapterData = await fetchChapters(id);

    // If fetch fails, serve stale cache if available
    if (!chapterData || !chapterData.data || chapterData.result !== 'ok') {
      if (cachedEntry) {
        console.warn(`[API /api/chapter] Fetch failed for ${id}, serving stale cache.`);
        const adaptedChapters = cachedEntry.data.map(adaptChapter);
        return NextResponse.json(adaptedChapters);
      }
      return NextResponse.json({ error: 'Could not fetch chapters from MangaDex' }, { status: 502 });
    }
    
    // Sort chapters before caching
    const sortedChapters = sortChapters(chapterData.data);
    
    // Update cache
    chapterCache.set(id, { data: sortedChapters, timestamp: Date.now() });
    
    const adaptedChapters = sortedChapters.map(adaptChapter);

    return NextResponse.json(adaptedChapters);

  } catch (error) {
    console.error(`[API /api/chapter] Exception for ID ${id}:`, error);
    const cachedEntry = chapterCache.get(id);
    // On any exception, serve stale cache if we have it.
    if (cachedEntry) {
       console.warn(`[API /api/chapter] Exception for ${id}, serving stale cache.`);
       const adaptedChapters = cachedEntry.data.map(adaptChapter);
       return NextResponse.json(adaptedChapters);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
