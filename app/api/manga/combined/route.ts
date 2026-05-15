
import { NextResponse } from 'next/server';
import { getAsuraData } from '../asura/route';
import { getFlameData } from '../flame/route';

export const dynamic = 'force-dynamic';

/**
 * Aggregated Discovery Matrix
 * Merges signals from Asura and Flame scans with an emergency fallback protocol.
 */
export async function GET() {
  try {
    const [asura, flame] = await Promise.all([
      getAsuraData(),
      getFlameData()
    ]);

    let allManga = [...(asura.data || []), ...(flame.data || [])];
    
    // Sort by title uniqueness to provide a better mix
    allManga = allManga.sort(() => Math.random() - 0.5);

    const sources = {
      asura: asura.data?.length || 0,
      flame: flame.data?.length || 0
    };

    // EMERGENCY PROTOCOL: If all real-time nodes fail, provide backup signals
    if (allManga.length === 0) {
      console.warn('⚠️ [MATRIX]: All primary nodes unreachable. Deploying emergency backup signals.');
      const backupSignals = [
        { id: 'solo-leveling', title: 'SOLO LEVELING', cover: 'https://picsum.photos/seed/solo/400/600', status: 'completed', source: 'asura', genres: ['Action', 'Fantasy'] },
        { id: 'omniscient-reader', title: 'OMNISCIENT READER', cover: 'https://picsum.photos/seed/orv/400/600', status: 'ongoing', source: 'flame', genres: ['System', 'Fantasy'] },
        { id: 'return-mount-hua', title: 'RETURN OF MOUNT HUA', cover: 'https://picsum.photos/seed/hua/400/600', status: 'ongoing', source: 'asura', genres: ['Martial Arts'] }
      ];
      return NextResponse.json({
        success: true,
        data: backupSignals,
        sources: { backup: backupSignals.length },
        error: 'Running on emergency backup signals'
      });
    }

    return NextResponse.json({
      success: true,
      data: allManga,
      sources,
      total: allManga.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMBINED CRASH]:', error);
    return NextResponse.json({
      success: false,
      error: 'Neural Link Fatal Crash',
      data: []
    }, { status: 500 });
  }
}
