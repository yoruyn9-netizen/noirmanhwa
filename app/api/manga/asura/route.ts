
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Direct Asura Scans Discovery Logic
 * Hardened with high-fidelity headers to bypass stricter WAF protection.
 */
export async function getAsuraData() {
  try {
    const endpoint = 'https://asuracomic.net/api/series?cursor=0&limit=50';
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://asuracomic.net/',
        'Origin': 'https://asuracomic.net',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Source Node Status: ${response.status}`);

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.series || data.data || []);
    
    if (list.length === 0) return { success: false, data: [] };

    return {
      success: true,
      source: 'asura',
      data: list.map((item: any) => ({
        id: item.slug || item.id,
        title: item.title || 'Signal Lost',
        cover: item.thumbnail?.url || item.cover?.url || item.image || '',
        status: item.status?.toLowerCase() || 'ongoing',
        type: 'MANHWA',
        source: 'asura',
        genres: item.genres?.map((g: any) => g.name || g) || []
      }))
    };
  } catch (error) {
    console.error('❌ [ASURA PROXY]:', error);
    return { success: false, data: [] };
  }
}

export async function GET() {
  const result = await getAsuraData();
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
