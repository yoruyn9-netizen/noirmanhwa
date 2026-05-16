
import { NextResponse } from 'next/server';
import { getAsuraData } from '../asura/route';
import { getFlameData } from '../flame/route';
import { getMangaDexData } from '../../mangadex/route';

export const dynamic = 'force-dynamic';

/**
 * Aggregated Discovery Matrix
 * Merges signals from MangaDex, Asura, and Flame with proper error handling.
 */
export async function GET() {
  const results: any[] = [];
  const errors: string[] = [];
  const sources: Record<string, number> = {};

  // Fetch all sources in parallel with error handling
  const [asuraResult, flameResult, mangadexResult] = await Promise.allSettled([
    getAsuraData(),
    getFlameData(),
    getMangaDexData()
  ]);

  // Process MangaDex
  if (mangadexResult.status === 'fulfilled' && mangadexResult.value?.data) {
    results.push(...mangadexResult.value.data);
    sources.mangadex = mangadexResult.value.data.length;
  } else if (mangadexResult.status === 'rejected') {
    errors.push(`MangaDex: ${mangadexResult.reason?.message || 'Unknown error'}`);
  }

  // Process Asura
  if (asuraResult.status === 'fulfilled' && asuraResult.value?.data) {
    results.push(...asuraResult.value.data);
    sources.asura = asuraResult.value.data.length;
  } else if (asuraResult.status === 'rejected') {
    errors.push(`Asura: ${asuraResult.reason?.message || 'Unknown error'}`);
  }

  // Process Flame
  if (flameResult.status === 'fulfilled' && flameResult.value?.data) {
    results.push(...flameResult.value.data);
    sources.flame = flameResult.value.data.length;
  } else if (flameResult.status === 'rejected') {
    errors.push(`Flame: ${flameResult.reason?.message || 'Unknown error'}`);
  }

  // Remove duplicates based on ID + source combo
  const uniqueMap = new Map();
  const allManga = results.filter(manga => {
    const key = `${manga.id}-${manga.source}`;
    if (uniqueMap.has(key)) return false;
    uniqueMap.set(key, true);
    return true;
  });

  // Shuffle for better variety
  allManga.sort(() => Math.random() - 0.5);

  if (allManga.length === 0) {
    return NextResponse.json({
      success: false,
      error: `All sources failed: ${errors.join(', ')}`,
      data: [],
      sources,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    data: allManga.slice(0, 100), // Limit to 100 for performance
    sources,
    total: allManga.length,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
