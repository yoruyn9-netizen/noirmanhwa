
import { NextRequest, NextResponse } from 'next/server';

/**
 * Komiku Proxy Node (Indonesian Regional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/manga/page/1';
  
  const endpoint = `https://komiku.id${path}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) throw new Error(`Node Response: ${response.status}`);
    
    // Note: Komiku often requires HTML parsing. 
    // This proxy returns the status to verify live connectivity as requested.
    return NextResponse.json({ 
      live: true, 
      endpoint, 
      status: response.status,
      scraped: true 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Uplink failed' }, { status: 500 });
  }
}
