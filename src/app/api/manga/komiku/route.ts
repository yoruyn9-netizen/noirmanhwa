import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Direct Komiku Logic
 */
export async function getKomikuData() {
  try {
    const response = await fetch('https://komiku.id/page/1/', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    return {
      success: true,
      source: 'komiku',
      count: 0,
      data: []
    };
  } catch (error) {
    return { success: false, source: 'komiku', data: [], count: 0 };
  }
}

export async function GET() {
  const result = await getKomikuData();
  return NextResponse.json(result);
}
