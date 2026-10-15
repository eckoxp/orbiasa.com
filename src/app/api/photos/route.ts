import { NextResponse } from 'next/server';
import { databaseUrl, sql } from '@/lib/db';

export async function GET() {
  if (!databaseUrl) {
    return NextResponse.json([]);
  }
  try {
    const rows = await sql`SELECT * FROM photos ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (_e: unknown) {
    return NextResponse.json([]);
  }
}


