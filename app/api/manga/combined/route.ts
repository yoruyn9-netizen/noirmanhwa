
import { NextResponse } from 'next/server';
import { getAsuraData } from '../asura/route';
import { getFlameData } from '../flame/route';

export const dynamic = 'force-dynamic';

/**
 * Combined API Route - Direct Logic execution
 * Bypasses internal fetch calls to prevent 503 network errors.
 */
export async function GET() {
  try {
    const [asura, flame] = await Promise.all([
      getAsuraData(),
      getFlameData()
    ]);

    const allManga = [...asura.data, ...flame.data];
    const sources = {
      asura: asura.data.length,
      flame: flame.data.length
    };

    if (allManga.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Total Signal Loss: Primary nodes unreachable',
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
    return NextResponse.json({
      success: false,
      error: 'Neural Link Crash',
      data: []
    }, { status: 500 });
  }
}
