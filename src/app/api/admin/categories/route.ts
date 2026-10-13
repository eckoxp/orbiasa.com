import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  // Ensure all required movie categories exist (upsert to avoid duplicates)
  await sql`INSERT INTO movie_categories (slug, name_ar, name_en) VALUES
            ('advertisements','الاعلانات المرئية','Visual Advertisements'),
            ('documentary','أفلام وثائقية','Documentary Films'),
            ('coverage','تغطية الفعاليات','Events Coverage')
            ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;`;
  
  const [movie, photo] = await Promise.all([
    sql`SELECT slug, name_ar, name_en FROM movie_categories ORDER BY created_at ASC;`,
    sql`SELECT slug, name_ar, name_en FROM photo_categories ORDER BY created_at ASC;`,
  ]);
  return NextResponse.json({ movies: movie, photos: photo });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { kind, slug, name_ar, name_en } = body || {};
  if (!kind || !slug || !name_ar || !name_en) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (kind === 'movie') {
    await sql`INSERT INTO movie_categories (slug, name_ar, name_en) VALUES (${slug}, ${name_ar}, ${name_en}) ON CONFLICT (slug) DO NOTHING;`;
  } else if (kind === 'photo') {
    await sql`INSERT INTO photo_categories (slug, name_ar, name_en) VALUES (${slug}, ${name_ar}, ${name_en}) ON CONFLICT (slug) DO NOTHING;`;
  } else {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}


