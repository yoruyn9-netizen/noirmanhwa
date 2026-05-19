import { NextRequest, NextResponse } from 'next/server';
import { fetchImageServerUrl, MangaDexImageServer } from '@/lib/mangadex';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // at-home server URLs are ephemeral

// A short-lived in-memory cache for the server URL for a given chapter,
// to handle rapid requests for multiple pages within the same chapter.
const serverCache = new Map<string, { server: MangaDexImageServer, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get('chapterId');
  const filename = searchParams.get('filename');
  const quality = searchParams.get('quality') === 'data' ? 'data' : 'data-saver';

  if (!chapterId || !filename) {
    return new NextResponse('Chapter ID and filename are required', { status: 400 });
  }

  try {
    let serverData: MangaDexImageServer | null = null;
    const cached = serverCache.get(chapterId);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      serverData = cached.server;
    } else {
      const freshData = await fetchImageServerUrl(chapterId);
      if (freshData && freshData.baseUrl) {
        serverCache.set(chapterId, { server: freshData, timestamp: Date.now() });
        serverData = freshData;
      }
    }
    
    if (!serverData) {
        return new NextResponse('Could not resolve MangaDex image server. The server may be offline or the chapter is unavailable.', { status: 504 });
    }

    const { baseUrl, chapter: { hash } } = serverData;
    const imageUrl = `${baseUrl}/${quality}/${hash}/${filename}`;

    // 307 Temporary Redirect is appropriate here, sending the client to the constructed URL.
    return NextResponse.redirect(new URL(imageUrl), 307);

  } catch (error) {
    console.error(`[API /api/image] Error for chapter ${chapterId}:`, error);
    return new NextResponse('Internal Server Error while fetching image URL.', { status: 500 });
  }
}
