
import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_BASE = 'https://api.mangadex.org';

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
    const response = await fetch(endpoint, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'NoirManhwa-Neural-Proxy/1.0'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'At-Home server node failure', status: response.status }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy Error]:', error);
    return NextResponse.json({ error: 'Neural link connection failed' }, { status: 500 });
  }
}
