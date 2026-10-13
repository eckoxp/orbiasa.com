import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([]);
  }
  try {
    const rows = await sql`SELECT * FROM photos ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (_e: unknown) {
    return NextResponse.json([]);
  }
}


