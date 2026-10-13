import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    // Return empty list when DB is not configured so the UI can fall back to sample data
    return NextResponse.json([]);
  }
  try {
    const rows = await sql`SELECT * FROM movies ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (_e: unknown) {
    // Be resilient in dev if DB is unreachable
    return NextResponse.json([]);
  }
}


