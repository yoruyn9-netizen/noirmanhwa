
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const endpoint = `${MANGADEX_BASE}/at-home/server/${chapterId}`;

  try {
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'At-Home server error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
