import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    // Internal fetch calls to individual source proxies
    const [asuraRes, flameRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/manga/asura`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/manga/flame`, { cache: 'no-store' })
    ]);

    const allManga: any[] = [];
    const sources: Record<string, number> = { asura: 0, flame: 0 };

    if (asuraRes.status === 'fulfilled' && asuraRes.value.ok) {
      const data = await asuraRes.value.json();
      if (data.success && Array.isArray(data.data)) {
        allManga.push(...data.data);
        sources.asura = data.data.length;
      }
    }

    if (flameRes.status === 'fulfilled' && flameRes.value.ok) {
      const data = await flameRes.value.json();
      if (data.success && Array.isArray(data.data)) {
        allManga.push(...data.data);
        sources.flame = data.data.length;
      }
    }

    console.log('📊 COMBINED SOURCES PULSE:', sources);

    if (allManga.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: All primary discovery nodes unreachable',
        sources,
        data: []
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      data: allManga,
      sources,
      total: allManga.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ COMBINED MATRIX CRASH:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown matrix error',
      data: []
    }, { status: 500 });
  }
}
