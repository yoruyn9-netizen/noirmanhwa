
/**
 * @fileOverview Flame Scans Driver
 */

const FLAME_PROXY = '/api/flame';

export async function fetchFlameLatest() {
  try {
    const res = await fetch(`${FLAME_PROXY}?path=/posts&per_page=20`);
    if (!res.ok) throw new Error(`Flame Node status: ${res.status}`);
    const data = await res.json();
    
    console.log('✅ FLAME LIVE:', data.length, 'items retrieved');
    
    return data.map((item: any) => ({
      id: item.slug,
      title: item.title?.rendered || 'Flame Signal',
      cover: item.featured_media_url || '',
      status: 'ongoing',
      genres: [],
      source: 'flame' as const,
      language: 'en',
      type: 'MANHWA'
    }));
  } catch (error) {
    console.error('❌ Flame Node unreachable:', error);
    return [];
  }
}
