
import { NextRequest, NextResponse } from 'next/server';

/**
 * Asura Scans Proxy Node
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/series';
  const query = searchParams.get('query');
  
  let endpoint = `https://asuracomic.net/api${path}`;
  if (query) endpoint += `?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://asuracomic.net/'
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) throw new Error(`Node Response: ${response.status}`);
    const data = await response.json();

    console.log('🔗 ASURA LIVE SYNC:', {
      endpoint,
      status: response.status,
      count: Array.isArray(data) ? data.length : 'Object'
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Asura Proxy Error]:', error);
    return NextResponse.json({ error: 'Uplink failed' }, { status: 500 });
  }
}
