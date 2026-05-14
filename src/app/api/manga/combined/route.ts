import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Unified Discovery Matrix
 * Orchestrates parallel requests to all proxy nodes.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  
  try {
    // Fetch from all sources in parallel via absolute URLs
    const [asuraRes, flameRes, komikuRes] = await Promise.allSettled([
      fetch(`${origin}/api/manga/asura`),
      fetch(`${origin}/api/manga/flame`),
      fetch(`${origin}/api/manga/komiku`)
    ]);

    const results = {
      asura: asuraRes.status === 'fulfilled' ? await asuraRes.value.json() : null,
      flame: flameRes.status === 'fulfilled' ? await flameRes.value.json() : null,
      komiku: komikuRes.status === 'fulfilled' ? await komikuRes.value.json() : null
    };

    const allManga: any[] = [];
    const sourcesHealth = {
      asura: 0,
      flame: 0,
      komiku: 0
    };

    Object.entries(results).forEach(([source, data]: [string, any]) => {
      if (data?.success && Array.isArray(data.data)) {
        allManga.push(...data.data);
        sourcesHealth[source as keyof typeof sourcesHealth] = data.data.length;
      }
    });

    if (allManga.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: All sources returned empty data',
        data: [],
        sources: sourcesHealth
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: allManga,
      sources: sourcesHealth,
      total: allManga.length
    });
  } catch (error) {
    console.error('❌ COMBINED API FAILED:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
