import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ensureContactTable } from '@/lib/contact';

export async function GET() {
  try {
    await ensureContactTable();
    const rows = await sql`
      SELECT id, name, email, phone, company, position, message, is_read, created_at
      FROM contact_messages ORDER BY created_at DESC LIMIT 500;
    `;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}