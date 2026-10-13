import { NextResponse } from 'next/server';
import { ensureTables } from '@/lib/db';

export async function POST() {
  try {
    await ensureTables();
    return NextResponse.json({ ok: true, message: 'Database tables created successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Migration error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTables();
    return NextResponse.json({ ok: true, message: 'Database tables created successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Migration error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


