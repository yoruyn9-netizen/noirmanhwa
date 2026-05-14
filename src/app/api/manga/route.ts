
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const offset = searchParams.get('offset') || '0';
  const limit = searchParams.get('limit') || '20';
  const title = searchParams.get('title');
  
  let endpoint = '/manga';
  const proxyParams = new URLSearchParams();

  switch (type) {
    case 'trending':
      endpoint = '/manga?limit=12&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&originalLanguage[]=ja&originalLanguage[]=ko&originalLanguage[]=zh';
      break;
    case 'latest':
      endpoint = `/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe&originalLanguage[]=ja&originalLanguage[]=ko&originalLanguage[]=zh`;
      break;
    case 'details':
      endpoint = `/manga/${id}?includes[]=cover_art&includes[]=author`;
      break;
    case 'search':
      proxyParams.append('limit', limit);
      proxyParams.append('offset', offset);
      proxyParams.append('includes[]', 'cover_art');
      proxyParams.append('contentRating[]', 'safe');
      proxyParams.append('contentRating[]', 'suggestive');
      proxyParams.append('order[followedCount]', 'desc');
      if (title) proxyParams.append('title', title);
      
      // Default to Asian languages if none specified
      proxyParams.append('originalLanguage[]', 'ja');
      proxyParams.append('originalLanguage[]', 'ko');
      proxyParams.append('originalLanguage[]', 'zh');
      
      endpoint = `/manga?${proxyParams.toString()}`;
      break;
    case 'tags':
      endpoint = '/manga/tag';
      break;
  }

  try {
    const response = await fetch(`${MANGADEX_BASE}${endpoint}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'MangaDex node error', status: response.status }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Neural link connection failed' }, { status: 500 });
  }
}
