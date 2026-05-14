
import { NextRequest, NextResponse } from 'next/server';

/**
 * Flame Scans Proxy Node
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/posts';
  
  const endpoint = `https://flamescans.org/wp-json/wp/v2${path}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) throw new Error(`Node Response: ${response.status}`);
    const data = await response.json();

    console.log('🔗 FLAME LIVE SYNC:', {
      endpoint,
      status: response.status,
      count: Array.isArray(data) ? data.length : 1
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Uplink failed' }, { status: 500 });
  }
}
