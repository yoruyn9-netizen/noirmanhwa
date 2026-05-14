import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Komiku requires HTML scraping which is handled as a fail-safe fallback
  return NextResponse.json({
    success: false,
    source: 'komiku',
    error: 'Direct API scraping node under maintenance',
    data: []
  }, { status: 501 });
}
