
import { NextResponse } from 'next/server';
import { getAsuraData, getFlameData, getMangaDexData } from '../source-utils';

export const dynamic = 'force-dynamic';

async function trySource(name: string, fn: () => Promise<any>) {
  try {
    const result = await fn();
    if (!result || !Array.isArray(result.data)) {
      console.warn(`❌ [COMBINED] ${name} returned invalid payload.`, { result });
      return { data: [] };
    }

    if (result.data.length === 0) {
      console.warn(`⚠️ [COMBINED] ${name} returned empty data array.`);
      return { data: [] };
    }

    return { data: result.data };
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    console.warn(`❌ [COMBINED] ${name} request failed:`, message);
    return { data: [] };
  }
}

export async function GET() {
  const sources = [
    { name: 'MangaDex', fn: getMangaDexData },
    { name: 'Asura', fn: getAsuraData },
    { name: 'Flame', fn: getFlameData }
  ];

  const settled = await Promise.allSettled(sources.map((source) => trySource(source.name, source.fn)));

  const results: any[] = [];
  const errors: string[] = [];
  const counts: Record<string, number> = {};

  settled.forEach((entry, index) => {
    const source = sources[index];

    if (entry.status === 'fulfilled') {
      const data = entry.value?.data || [];
      if (data.length > 0) {
        results.push(...data);
        counts[source.name.toLowerCase()] = data.length;
      }
    } else {
      errors.push(`${source.name}: ${entry.reason?.message || 'unknown failure'}`);
      console.warn(`❌ [COMBINED] ${source.name} failed`, entry.reason);
    }
  });

  const uniqueMap = new Map<string, boolean>();
  const allManga = results.filter((manga) => {
    const key = `${manga.id}-${manga.source}`;
    if (uniqueMap.has(key)) return false;
    uniqueMap.set(key, true);
    return true;
  });

  allManga.sort(() => Math.random() - 0.5);

  if (allManga.length === 0) {
    console.warn('⚠️ [COMBINED] No source returned usable data.', { counts, errors });
    return NextResponse.json(
      {
        success: false,
        data: [],
        sources: counts,
        errors: errors.length > 0 ? errors : ['No sources returned valid data'],
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: allManga.slice(0, 100),
      sources: counts,
      total: allManga.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
