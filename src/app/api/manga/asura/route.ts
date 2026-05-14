import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Asura Scans Proxy Node with High-Fidelity Logging
 */
export async function GET() {
  const startTime = Date.now();
  console.log('📡 [ASURA PROXY] Initializing discovery protocol...');
  
  try {
    const endpoint = 'https://asuracomic.net/api/series?cursor=0&limit=50';
    console.log(`🔗 [ASURA PROXY] Fetching target: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://asuracomic.net/',
      },
      next: { revalidate: 3600 }
    });

    console.log(`📊 [ASURA PROXY] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ [ASURA PROXY] Upstream Error:`, errorBody.slice(0, 500));
      throw new Error(`Asura Node Error: ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    console.log(`✅ [ASURA PROXY] Sync Success: ${list.length} items parsed in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      source: 'asura',
      count: list.length,
      data: list.map((item: any, idx: number) => ({
        id: item.slug || item.id || `asura-node-${idx}`,
        title: item.title || 'Unknown Title',
        cover: item.thumbnail?.url || item.cover?.url || item.thumbnail || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'manhwa',
        source: 'asura',
        genres: item.genres?.map((g: any) => g.name || g) || []
      }))
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown neural link failure';
    console.error(`❌ [ASURA PROXY] CRITICAL:`, msg);
    return NextResponse.json({
      success: false,
      source: 'asura',
      error: msg,
      data: []
    }, { status: 500 });
  }
}
