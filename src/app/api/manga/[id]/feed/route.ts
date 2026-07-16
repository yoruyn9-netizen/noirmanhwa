
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';
const MANGADEX_HEADERS = {
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://mangadex.org/',
  'Origin': 'https://mangadex.org'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get('offset') || '0';

  const languages = ['en', 'id'];
  const langParams = languages.map(l => `translatedLanguage[]=${l}`).join('&');
  
  const endpoint = `${MANGADEX_BASE}/manga/${id}/feed?${langParams}&order[chapter]=desc&limit=100&offset=${offset}`;

  try {
    const response = await fetch(endpoint, {
      headers: MANGADEX_HEADERS,
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'MangaDex feed error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
