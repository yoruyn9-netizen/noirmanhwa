
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';
const MANGADEX_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangadex.org/',
  'Origin': 'https://mangadex.org'
};

async function fetchWithRetry(endpoint: string, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(endpoint, {
      headers: MANGADEX_HEADERS,
      cache: 'no-store',
    });

    if (response.ok) return response;
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  return null;
}

/**
 * Unified API Proxy for MangaDex At-Home Server
 * Standardized on 'id' slug to resolve filesystem collisions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  
  if (!chapterId) {
    return NextResponse.json({ error: 'Missing chapter identity' }, { status: 400 });
  }

  const endpoint = `${MANGADEX_BASE}/at-home/server/${chapterId}`;

  try {
    const response = await fetchWithRetry(endpoint);

    if (!response || !response.ok) {
      const status = response?.status || 502;
      console.error(`[API /api/at-home/${chapterId}] MangaDex responded ${status}`);
      return NextResponse.json(
        { error: 'At-Home server node failure', status }, 
        { status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/at-home] Proxy Error:', error);
    return NextResponse.json({ error: 'Neural link connection failed' }, { status: 500 });
  }
}
