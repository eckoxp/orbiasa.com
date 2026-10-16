import { NextResponse } from 'next/server';
import { databaseUrl, sql } from '@/lib/db';

export async function GET() {
  if (!databaseUrl) {
    // Return empty list when DB is not configured so the UI can fall back to sample data
    return NextResponse.json([]);
  }
  try {
    const rows = await sql`SELECT * FROM movies ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
   } catch (e: unknown) {
    console.error('GET /api/movies failed:', e);
    return NextResponse.json({ error: 'Failed to load movies' }, { status: 500 });
  }
}


