
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  let endpoint = '/manga';
  const proxyParams = new URLSearchParams();

  switch (type) {
    case 'trending':
      endpoint = '/manga?limit=12&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&originalLanguage[]=ja&originalLanguage[]=ko&originalLanguage[]=zh';
      break;
    case 'latest':
      searchParams.forEach((val, key) => {
        if (key !== 'type') proxyParams.append(key, val);
      });
      proxyParams.append('limit', '24');
      proxyParams.append('includes[]', 'cover_art');
      proxyParams.append('order[latestUploadedChapter]', 'desc');
      proxyParams.append('contentRating[]', 'safe');
      proxyParams.append('originalLanguage[]', 'ja');
      proxyParams.append('originalLanguage[]', 'ko');
      proxyParams.append('originalLanguage[]', 'zh');
      endpoint = `/manga?${proxyParams.toString()}`;
      break;
    case 'details':
      endpoint = `/manga/${id}?includes[]=cover_art&includes[]=author`;
      break;
    case 'search':
      searchParams.forEach((val, key) => {
        if (key !== 'type') proxyParams.append(key, val);
      });
      proxyParams.append('includes[]', 'cover_art');
      proxyParams.append('contentRating[]', 'safe');
      proxyParams.append('contentRating[]', 'suggestive');
      // If no languages specified in the client request, we default them here
      if (!searchParams.has('originalLanguage[]')) {
        proxyParams.append('originalLanguage[]', 'ja');
        proxyParams.append('originalLanguage[]', 'ko');
        proxyParams.append('originalLanguage[]', 'zh');
      }
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
      return NextResponse.json({ error: 'MangaDex node error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
