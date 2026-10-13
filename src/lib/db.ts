import { neon } from '@neondatabase/serverless';

export type MovieCategory = 'advertisements' | 'documentary' | 'coverage';
export type PhotoCategory = 'coverage' | 'products' | 'portraits' | 'ads';

export interface MovieRow {
  id: string;
  category: MovieCategory;
  title_ar: string;
  title_en: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoRow {
  id: string;
  category: PhotoCategory;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

type SqlTagged = ReturnType<typeof neon>;

// Avoid initializing a connection during static builds when env isn't present.
export const sql: SqlTagged = (process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL as string)
  : (((() => {
      throw new Error('DATABASE_URL env var is not set');
    }) as unknown) as SqlTagged));

export async function ensureTables(): Promise<void> {
  // Ensure required extension for gen_random_uuid
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
  
  // Category tables
  await sql`
    CREATE TABLE IF NOT EXISTS movie_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      name_ar text NOT NULL,
      name_en text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photo_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      name_ar text NOT NULL,
      name_en text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // Movies table (drop historical check constraint if exists)
  await sql`CREATE TABLE IF NOT EXISTS movies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category text NOT NULL,
      title_ar text NOT NULL,
      title_en text NOT NULL,
      video_url text NOT NULL,
      thumbnail_url text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`;
  await sql`ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_category_check;`;
  
  // Add thumbnail_url column if it doesn't exist (for existing databases)
  try {
    await sql`ALTER TABLE movies ADD COLUMN IF NOT EXISTS thumbnail_url text;`;
    console.log('Successfully added thumbnail_url column to movies table');
  } catch (error) {
    console.log('thumbnail_url column may already exist or there was an issue:', error);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category text NOT NULL,
      title_ar text NOT NULL,
      title_en text NOT NULL,
      description_ar text NOT NULL,
      description_en text NOT NULL,
      image_url text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_category_check;`;

  // Seed default categories
  await sql`INSERT INTO movie_categories (slug, name_ar, name_en) VALUES
            ('advertisements','الاعلانات المرئية','Visual Advertisements'),
            ('documentary','أفلام وثائقية','Documentary Films'),
            ('coverage','تغطية الفعاليات','Events Coverage')
            ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;`;
  await sql`INSERT INTO photo_categories (slug, name_ar, name_en) VALUES
            ('ads','تصوير الاعلاني','Advertising Photography'),
            ('coverage','تصوير التغطيات','Event Coverage Photography'),
            ('portraits','تصوير البورتريه','Portrait Photography'),
            ('products','تصوير المنتجات','Product Photography')
            ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;`;
}


