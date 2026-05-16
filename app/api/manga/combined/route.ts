
import { NextResponse } from 'next/server';
import { getAsuraData, getFlameData, getMangaDexData } from '../source-utils';

export const dynamic = 'force-dynamic';

async function trySource(name: string, fn: () => Promise<any>) {
  try {
    const result = await fn();
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      return result;
    }
    throw new Error(`${name} returned no valid data`);
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    console.warn(`❌ [COMBINED] ${name} fallback error:`, message);
    return { error: message };
  }
}

/**
 * Aggregated Discovery Matrix
 * Merges signals from MangaDex, Asura, and Flame with proper error handling.
 */
export async function GET() {
  const results: any[] = [];
  const errors: string[] = [];
  const sources: Record<string, number> = {};

  const mangadexResult = await trySource('MangaDex', getMangaDexData);
  if (mangadexResult?.data?.length) {
    results.push(...mangadexResult.data);
    sources.mangadex = mangadexResult.data.length;
  } else {
    errors.push(`MangaDex: ${mangadexResult.error}`);
  }

  const asuraResult = await trySource('Asura', getAsuraData);
  if (asuraResult?.data?.length) {
    results.push(...asuraResult.data);
    sources.asura = asuraResult.data.length;
  } else {
    errors.push(`Asura: ${asuraResult.error}`);
  }

  const flameResult = await trySource('Flame', getFlameData);
  if (flameResult?.data?.length) {
    results.push(...flameResult.data);
    sources.flame = flameResult.data.length;
  } else {
    errors.push(`Flame: ${flameResult.error}`);
  }

  const uniqueMap = new Map();
  const allManga = results.filter((manga) => {
    const key = `${manga.id}-${manga.source}`;
    if (uniqueMap.has(key)) return false;
    uniqueMap.set(key, true);
    return true;
  });

  allManga.sort(() => Math.random() - 0.5);

  if (allManga.length === 0) {
    console.warn('⚠️ [COMBINED] All discovery sources failed.', { errors, sources });
    return NextResponse.json(
      {
        success: false,
        error: `All sources failed: ${errors.join(' | ')}`,
        data: [],
        sources,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: allManga.slice(0, 100),
      sources,
      total: allManga.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
