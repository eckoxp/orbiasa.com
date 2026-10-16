import { NextResponse } from 'next/server';
import { sql, MovieCategory, ensureTables } from '@/lib/db';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string | null;
  const category = form.get('category') as MovieCategory;
  const title_ar = String(form.get('title_ar') || '');
  const title_en = String(form.get('title_en') || '');
  const video_url = String(form.get('video_url') || '');
  const uploadedThumbnailUrl = String(form.get('thumbnail_url') || '');
  const thumbnail_url = uploadedThumbnailUrl || null;
  
  if (!category || !title_ar || !title_en || !video_url) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }
  
  try {
    if (id) {
      // Update existing movie
      if (thumbnail_url) {
        await sql`
          UPDATE movies 
          SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, video_url = ${video_url}, thumbnail_url = ${thumbnail_url}, updated_at = NOW()
          WHERE id = ${id};
        `;
      } else {
        await sql`
          UPDATE movies 
          SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, video_url = ${video_url}, updated_at = NOW()
          WHERE id = ${id};
        `;
      }
    } else {
      // Insert new movie
      await sql`INSERT INTO movies (category,title_ar,title_en,video_url,thumbnail_url) VALUES (${category}, ${title_ar}, ${title_en}, ${video_url}, ${thumbnail_url});`;
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    
    // If the error is about thumbnail_url column not existing, try to run migration
    if (message.includes('thumbnail_url') && message.includes('does not exist')) {
      try {
        console.log('Running database migration to add thumbnail_url column...');
        await ensureTables();
        
        // Retry the database operation after migration. The file is already in R2.
        const retryThumbnailUrl = thumbnail_url;
        
        if (id) {
          // Update existing movie
          if (retryThumbnailUrl) {
            await sql`
              UPDATE movies 
              SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, video_url = ${video_url}, thumbnail_url = ${retryThumbnailUrl}, updated_at = NOW()
              WHERE id = ${id};
            `;
          } else {
            await sql`
              UPDATE movies 
              SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, video_url = ${video_url}, updated_at = NOW()
              WHERE id = ${id};
            `;
          }
        } else {
          // Insert new movie
          await sql`INSERT INTO movies (category,title_ar,title_en,video_url,thumbnail_url) VALUES (${category}, ${title_ar}, ${title_en}, ${video_url}, ${retryThumbnailUrl});`;
        }
        
        return NextResponse.json({ ok: true });
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
        return NextResponse.json({ ok: false, error: 'Database migration failed: ' + (migrationError instanceof Error ? migrationError.message : String(migrationError)) }, { status: 500 });
      }
    }
    
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM movies ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


