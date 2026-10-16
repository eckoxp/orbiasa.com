import { sql } from '@/lib/db';

export async function ensureContactTable(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS contact_messages (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company text NOT NULL,
    position text,
    message text NOT NULL,
    ip text,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  );`;
}