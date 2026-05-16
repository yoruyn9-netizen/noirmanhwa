
import { NextResponse } from 'next/server';
import { getFlameData } from '../source-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getFlameData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [FLAME GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Flame data',
      data: []
    }, { status: 503 });
  }
}

