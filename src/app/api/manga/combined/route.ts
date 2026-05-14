import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Unified Discovery Matrix
 * Orchestrates parallel requests to internal proxy nodes with dynamic origin detection.
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  const { origin } = new URL(request.url);
  console.log(`🔄 [MATRIX] Initializing combined fetch from origin: ${origin}`);
  
  try {
    // Fetch from all sources in parallel via absolute URLs on this same host
    const [asuraRes, flameRes, komikuRes] = await Promise.allSettled([
      fetch(`${origin}/api/manga/asura`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${origin}/api/manga/flame`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${origin}/api/manga/komiku`).then(r => r.ok ? r.json() : Promise.reject(r.status))
    ]);

    const allManga: any[] = [];
    const sourcesHealth: Record<string, any> = {
      asura: 'OFFLINE',
      flame: 'OFFLINE',
      komiku: 'OFFLINE'
    };

    // Process Asura Results
    if (asuraRes.status === 'fulfilled' && asuraRes.value.success) {
      allManga.push(...asuraRes.value.data);
      sourcesHealth.asura = `${asuraRes.value.count} items`;
    } else {
      console.warn(`⚠️ [MATRIX] Asura node bypassed:`, asuraRes.status === 'rejected' ? asuraRes.reason : 'Empty');
    }

    // Process Flame Results
    if (flameRes.status === 'fulfilled' && flameRes.value.success) {
      allManga.push(...flameRes.value.data);
      sourcesHealth.flame = `${flameRes.value.count} items`;
    } else {
      console.warn(`⚠️ [MATRIX] Flame node bypassed:`, flameRes.status === 'rejected' ? flameRes.reason : 'Empty');
    }

    // Process Komiku Results
    if (komikuRes.status === 'fulfilled' && komikuRes.value.success) {
      allManga.push(...komikuRes.value.data);
      sourcesHealth.komiku = `Verified`;
    }

    console.log(`📊 [MATRIX] Node Pulse Check:`, sourcesHealth);

    if (allManga.length === 0) {
      console.error(`❌ [MATRIX] Total Signal Loss in all sectors.`);
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: All discovery nodes unreachable',
        data: [],
        sources: sourcesHealth
      }, { status: 503 }); // 503 Service Unavailable is more accurate than 500
    }

    console.log(`✅ [MATRIX] Composite stream ready: ${allManga.length} items in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: allManga,
      sources: sourcesHealth,
      total: allManga.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MATRIX] Critical orchestrator failure:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown orchestrator error',
      data: []
    }, { status: 500 });
  }
}
