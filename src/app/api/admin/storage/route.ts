import { NextResponse } from 'next/server';
import { getR2Usage, getStorageLimitBytes } from '@/lib/r2';

export async function GET() {
  try {
    const { usedBytes, objectCount } = await getR2Usage();
    const limitBytes = getStorageLimitBytes();
    return NextResponse.json({
      usedBytes,
      limitBytes,
      remainingBytes: Math.max(0, limitBytes - usedBytes),
      objectCount,
    });
  } catch (error) {
    console.error('GET /api/admin/storage failed:', error);
    return NextResponse.json({ error: 'Could not read storage usage' }, { status: 500 });
  }
}