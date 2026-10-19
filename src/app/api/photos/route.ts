import { NextResponse } from 'next/server';
import { databaseUrl, ensureTables, sql } from '@/lib/db';

export async function GET() {
  if (!databaseUrl) {
    return NextResponse.json([]);
  }
  try {
    await ensureTables();
    const rows = await sql`
      SELECT group_id::text AS id, group_id::text AS group_id, category, title_ar, title_en,
        description_ar, description_en,
        (array_agg(image_url ORDER BY created_at, id))[1] AS image_url,
        array_agg(image_url ORDER BY created_at, id) AS image_urls,
        COUNT(*)::int AS image_count,
        MIN(created_at) AS created_at, MAX(updated_at) AS updated_at
      FROM photos
      GROUP BY group_id, category, title_ar, title_en, description_ar, description_en
      ORDER BY MIN(created_at) DESC;
    `;
    return NextResponse.json(rows);
  } catch (_e: unknown) {
    return NextResponse.json([]);
  }
}


