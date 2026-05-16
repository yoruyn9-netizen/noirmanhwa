
import { NextResponse } from 'next/server';
import { getAsuraData } from '../source-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getAsuraData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [ASURA GET ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Asura data',
      data: []
    }, { status: 503 });
  }
}

