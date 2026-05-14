
/**
 * @fileOverview Asura Scans Driver
 * High-fidelity interface for the Asura Scans API via internal proxy.
 */

const ASURA_PROXY = '/api/asura';

export async function fetchAsuraLatest() {
  try {
    const res = await fetch(`${ASURA_PROXY}?path=/series&limit=50`);
    if (!res.ok) throw new Error(`Asura Node status: ${res.status}`);
    const data = await res.json();
    
    const list = Array.isArray(data) ? data : (data.series || []);
    
    console.log('✅ ASURA LIVE:', list.length, 'items retrieved');
    
    return list.map((item: any) => ({
      id: item.slug || item.id,
      title: item.title || 'Unknown Signal',
      cover: item.thumbnail?.url || item.cover?.url || item.thumbnail || '',
      status: item.status?.toLowerCase() || 'ongoing',
      genres: item.genres?.map((g: any) => g.name || g) || [],
      source: 'asura' as const,
      language: 'en',
      type: 'MANHWA'
    }));
  } catch (error) {
    console.error('❌ Asura Node unreachable:', error);
    return [];
  }
}

export async function fetchAsuraChapters(slug: string) {
  try {
    const res = await fetch(`${ASURA_PROXY}?path=/series/${slug}`);
    if (!res.ok) throw new Error(`Asura Chapter Node status: ${res.status}`);
    const data = await res.json();
    
    const chapters = data.chapters || [];
    console.log(`✅ ASURA CHAPTERS [${slug}]:`, chapters.length);
    
    return chapters.map((ch: any) => ({
      id: ch.id || ch.slug,
      mangaId: slug,
      number: ch.number || ch.title,
      title: ch.title || `Chapter ${ch.number}`,
      source: 'asura' as const,
      publishAt: ch.created_at
    })).sort((a: any, b: any) => parseFloat(b.number) - parseFloat(a.number));
  } catch (error) {
    console.error(`❌ Asura Chapter Link Failed [${slug}]:`, error);
    return [];
  }
}
