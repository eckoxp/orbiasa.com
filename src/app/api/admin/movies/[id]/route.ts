import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { deleteR2ObjectByUrl } from '@/lib/r2';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const rows = (await sql`SELECT video_url, thumbnail_url FROM movies WHERE id = ${id};`) as Record<string, string | null>[];
    await sql`DELETE FROM movies WHERE id = ${id};`;

    // Best effort: a storage error must not undo or block the delete.
    try {
      await deleteR2ObjectByUrl(rows[0]?.video_url);
      await deleteR2ObjectByUrl(rows[0]?.thumbnail_url);
    } catch (err) {
      console.error('R2 cleanup failed:', err);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { category, title_ar, title_en, video_url } = body;
    
    if (!id || !category || !title_ar || !title_en || !video_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      UPDATE movies 
      SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, 
          video_url = ${video_url}, updated_at = NOW()
      WHERE id = ${id};
    `;
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}