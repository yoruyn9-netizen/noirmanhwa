
import { NextRequest, NextResponse } from 'next/server';

/**
 * Flame Scans Proxy Node
 * Standardized on WordPress JSON API protocols.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/posts';
  
  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.delete('path');
  
  const queryString = upstreamParams.toString();
  const endpoint = `https://flamescans.org/wp-json/wp/v2${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Node Restricted: ${response.status}` }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Uplink failed' }, { status: 500 });
  }
}
