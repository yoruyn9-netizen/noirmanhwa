
/**
 * @fileOverview Asura Scans Driver
 * Features dual-path discovery to maximize signal retention.
 */

const ASURA_PROXY = '/api/asura';

export async function fetchAsuraLatest() {
  try {
    // Strategy 1: Attempt standard series discovery
    let res = await fetch(`${ASURA_PROXY}?path=/series&limit=30`);
    
    // Strategy 2: If primary path fails, attempt latest-update relay
    if (!res.ok) {
      console.warn(`[Asura Node]: Primary path restricted (Status ${res.status}). Relaying to secondary...`);
      res = await fetch(`${ASURA_PROXY}?path=/series/latest&limit=30`);
    }

    if (!res.ok) {
      console.error(`[Asura Node]: Total path failure (Status ${res.status})`);
      return [];
    }
    
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    if (list.length === 0) {
      console.warn('[Asura Node]: Received empty data packet.');
      return [];
    }

    console.log(`✅ ASURA LIVE: ${list.length} items retrieved.`);

    return list.map((item: any) => ({
      id: item.slug || item.id,
      title: item.title || 'Unknown Signal',
      cover: item.thumbnail?.url || item.cover?.url || item.thumbnail || '',
      status: item.status?.toLowerCase() || 'ongoing',
      genres: item.genres?.map((g: any) => g.name || g) || [],
      source: 'asura' as const,
      language: 'en',
      type: 'manhwa'
    }));
  } catch (error) {
    console.error('❌ Asura Node unreachable:', error);
    return [];
  }
}

export async function fetchAsuraChapters(slug: string) {
  try {
    const res = await fetch(`${ASURA_PROXY}?path=/series/${slug}/chapters`);
    if (!res.ok) return [];
    const data = await res.json();
    
    const chapters = data.chapters || (Array.isArray(data) ? data : []);
    
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
