import { NextResponse } from 'next/server';
import { getAsuraData } from '../asura/route';
import { getFlameData } from '../flame/route';
import { getKomikuData } from '../komiku/route';

export const dynamic = 'force-dynamic';

/**
 * Optimized Unified Discovery Matrix
 * Bypasses internal fetch origin issues by executing discovery logic directly.
 */
export async function GET() {
  const startTime = Date.now();
  console.log('🔄 [MATRIX] Initializing direct discovery protocol...');
  
  try {
    // Execute all discovery logic in parallel directly
    const [asuraResult, flameResult, komikuResult] = await Promise.all([
      getAsuraData(),
      getFlameData(),
      getKomikuData()
    ]);

    const allManga: any[] = [];
    const sourcesHealth: Record<string, string> = {
      asura: asuraResult.success ? `${asuraResult.count} items` : 'OFFLINE',
      flame: flameResult.success ? `${flameResult.count} items` : 'OFFLINE',
      komiku: komikuResult.success ? 'Verified' : 'OFFLINE'
    };

    if (asuraResult.success) allManga.push(...asuraResult.data);
    if (flameResult.success) allManga.push(...flameResult.data);
    if (komikuResult.success) allManga.push(...komikuResult.data);

    console.log(`📊 [MATRIX] Node Pulse Check:`, sourcesHealth);

    // If we have AT LEAST ONE source working, return success.
    // This prevents a 503 if one node is down but others have data.
    if (allManga.length === 0) {
      console.error(`❌ [MATRIX] Total Signal Loss in all sectors.`);
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: All discovery nodes unreachable',
        data: [],
        sources: sourcesHealth
      }, { status: 503 });
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
