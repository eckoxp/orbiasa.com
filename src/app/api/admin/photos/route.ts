import { NextResponse } from 'next/server';
import { ensureTables, sql, PhotoCategory } from '@/lib/db';

const groupedPhotos = () => sql`
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

export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string | null;
  const category = form.get('category') as PhotoCategory;
  const title_ar = String(form.get('title_ar') || '');
  const title_en = String(form.get('title_en') || '');
  const description_ar = String(form.get('description_ar') || '');
  const description_en = String(form.get('description_en') || '');
  const image_urls = form.getAll('image_url').map(String).filter(Boolean);
  
  if (!category || !title_ar || !title_en || !description_ar || !description_en) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }
  
  try {
    await ensureTables();
    if (id) {
      await sql`
        UPDATE photos
        SET category = ${category}, title_ar = ${title_ar}, title_en = ${title_en},
            description_ar = ${description_ar}, description_en = ${description_en}, updated_at = NOW()
        WHERE group_id = ${id};
      `;
      for (const imageUrl of image_urls) {
        await sql`
          INSERT INTO photos (group_id,category,title_ar,title_en,description_ar,description_en,image_url)
          VALUES (${id}, ${category}, ${title_ar}, ${title_en}, ${description_ar}, ${description_en}, ${imageUrl});
        `;
      }
    } else {
      if (image_urls.length === 0) {
        return NextResponse.json({ ok: false, error: 'At least one image is required' }, { status: 400 });
      }
      const groupRows = (await sql`SELECT gen_random_uuid()::text AS id;`) as Record<string, string>[];
      const groupId = String(groupRows[0].id);
      for (const imageUrl of image_urls) {
        await sql`
          INSERT INTO photos (group_id,category,title_ar,title_en,description_ar,description_en,image_url)
          VALUES (${groupId}, ${category}, ${title_ar}, ${title_en}, ${description_ar}, ${description_en}, ${imageUrl});
        `;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTables();
    return NextResponse.json(await groupedPhotos());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
