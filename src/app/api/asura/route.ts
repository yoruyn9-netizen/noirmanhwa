
import { NextRequest, NextResponse } from 'next/server';

/**
 * Asura Scans Proxy Node
 * Hardened with high-fidelity browser spoofing to bypass WAF/Bot protection.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/series';
  
  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.delete('path');
  
  const queryString = upstreamParams.toString();
  // Asura often uses asuracomic.net or asurascans.com
  const endpoint = `https://asuracomic.net/api${path}${queryString ? `?${queryString}` : ''}`;

  try {
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
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.warn(`[Asura Proxy]: Node ${endpoint} returned status ${response.status}`);
      return NextResponse.json({ error: `Source Error ${response.status}`, status: response.status }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Asura Proxy Error]:', error);
    return NextResponse.json({ error: 'Uplink connection timeout' }, { status: 504 });
  }
}
