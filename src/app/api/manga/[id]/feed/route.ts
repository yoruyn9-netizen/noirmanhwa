
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

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
      headers: { 'Accept': 'application/json' },
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
