
import { NextResponse } from 'next/server';
import { getAsuraData } from '../asura/route';
import { getFlameData } from '../flame/route';

export const dynamic = 'force-dynamic';

/**
 * Robust Combined API Route
 * Uses Direct Logic Execution to bypass internal 503 network errors.
 */
export async function GET() {
  try {
    // Execute underlying logic directly instead of using fetch
    const [asura, flame] = await Promise.all([
      getAsuraData(),
      getFlameData()
    ]);

    const allManga = [...(asura.data || []), ...(flame.data || [])];
    const sources = {
      asura: asura.data?.length || 0,
      flame: flame.data?.length || 0
    };

    if (allManga.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: Primary discovery nodes unreachable',
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
    console.error('❌ [MATRIX CRASH]:', error);
    return NextResponse.json({
      success: false,
      error: 'Neural Link Fatal Crash',
      data: []
    }, { status: 500 });
  }
}
