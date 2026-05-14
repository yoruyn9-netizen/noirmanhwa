import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Komiku Server-Side Proxy (Health Check)
 */
export async function GET() {
  try {
    const response = await fetch('https://komiku.id/page/1/', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Komiku error: ${response.status}`);

    // Komiku requires HTML parsing which is best done on client or with a lib like cheerio
    // For now, we return a success status to verify the node is alive
    console.log('✅ KOMIKU PROXY SUCCESS');

    return NextResponse.json({
      success: true,
      source: 'komiku',
      count: 0,
      data: []
    });
  } catch (error) {
    console.error('❌ KOMIKU PROXY FAILED:', error);
    return NextResponse.json({
      success: false,
      source: 'komiku',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
