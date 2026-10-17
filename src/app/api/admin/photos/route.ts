import { NextResponse } from 'next/server';
import { sql, PhotoCategory } from '@/lib/db';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string | null;
  const category = form.get('category') as PhotoCategory;
  const title_ar = String(form.get('title_ar') || '');
  const title_en = String(form.get('title_en') || '');
  const description_ar = String(form.get('description_ar') || '');
  const description_en = String(form.get('description_en') || '');
  const image_url = String(form.get('image_url') || '');
  
  if (!category || !title_ar || !title_en || !description_ar || !description_en) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }
  
  try {
    if (id) {
      // Update existing photo
      if (image_url) {
        await sql`
          UPDATE photos 
          SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, 
              description_ar = ${description_ar}, description_en = ${description_en}, 
              image_url = ${image_url}, updated_at = NOW()
          WHERE id = ${id};
        `;
      } else {
        // Update without changing image
        await sql`
          UPDATE photos 
          SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en}, 
              description_ar = ${description_ar}, description_en = ${description_en}, updated_at = NOW()
          WHERE id = ${id};
        `;
      }
    } else {
      // The browser uploads the file directly to R2 before saving this record.
      if (!image_url) {
        return NextResponse.json({ ok: false, error: 'Image file is required for new photos' }, { status: 400 });
      }
      await sql`INSERT INTO photos (category,title_ar,title_en,description_ar,description_en,image_url) VALUES (${category}, ${title_ar}, ${title_en}, ${description_ar}, ${description_en}, ${image_url});`;
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM photos ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


