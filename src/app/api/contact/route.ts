import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ensureContactTable } from '@/lib/contact';
import { getClientIp } from '@/lib/rateLimit';

const MAX_PER_HOUR = 5;

type ContactBody = {
  name?: string; email?: string; phone?: string; company?: string;
  position?: string; message?: string;
  website?: string; // honeypot
};

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  const body: ContactBody = await req.json().catch(() => ({}));

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots don't retry.
  if (body.website) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 200);
  const position = clean(body.position, 200);
  const message = clean(body.message, 5000);

  if (!name || !email || !phone || !company || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    await ensureContactTable();
    const ip = getClientIp(req);

    const rows = (await sql`
      SELECT count(*)::int AS n FROM contact_messages
      WHERE ip = ${ip} AND created_at > now() - interval '1 hour';
    `) as Record<string, unknown>[];
    if (Number(rows[0]?.n ?? 0) >= MAX_PER_HOUR) {
      return NextResponse.json({ error: 'Too many messages' }, { status: 429 });
    }

    await sql`
      INSERT INTO contact_messages (name, email, phone, company, position, message, ip)
      VALUES (${name}, ${email}, ${phone}, ${company}, ${position || null}, ${message}, ${ip});
    `;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('POST /api/contact failed:', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}