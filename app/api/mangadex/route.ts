import { NextResponse } from 'next/server';
import { getMangaDexData } from '../manga/source-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getMangaDexData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [MANGADEX GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch MangaDex data',
      data: []
    }, { status: 503 });
  }
}
