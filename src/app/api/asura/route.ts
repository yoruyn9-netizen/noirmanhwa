
import { NextRequest, NextResponse } from 'next/server';

/**
 * Asura Scans Proxy Node
 * Enhanced with robust browser spoofing and parameter relay.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/series';
  
  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.delete('path');
  
  const queryString = upstreamParams.toString();
  const endpoint = `https://asuracomic.net/api${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://asuracomic.net/',
        'Origin': 'https://asuracomic.net',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 60 } // Aggressive cache for stability
    });

    if (!response.ok) {
      console.warn(`[Asura Proxy]: Node ${endpoint} returned status ${response.status}`);
      return NextResponse.json({ error: `Source Error ${response.status}` }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Asura Proxy Error]:', error);
    return NextResponse.json({ error: 'Uplink connection timeout' }, { status: 504 });
  }
}
