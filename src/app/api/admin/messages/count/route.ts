import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ensureContactTable } from '@/lib/contact';

export async function GET() {
  try {
    await ensureContactTable();
    const rows = (await sql`SELECT count(*)::int AS n FROM contact_messages WHERE is_read = false;`) as Record<string, unknown>[];
    return NextResponse.json({ unread: Number(rows[0]?.n ?? 0) });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}