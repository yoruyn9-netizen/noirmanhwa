
import { NextRequest, NextResponse } from 'next/server';

const MANGAMINT_BASE = 'https://mangamint.kaedenoki.net/api';

/**
 * Proxy for MangaMint (Indonesian Signal Node)
 * Bypasses CORS and provides server-side fetching.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing frequency path' }, { status: 400 });
  }

  try {
    const response = await fetch(`${MANGAMINT_BASE}${path}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NoirManhwa-Neural-Proxy/1.0',
      },
      next: { revalidate: 600 } // 10 minute revalidation
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Node unreachable', status: response.status }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Signal connection timed out' }, { status: 500 });
  }
}
