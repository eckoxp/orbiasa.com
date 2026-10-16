import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

async function getId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const id = await getId(ctx);
    if (id === null) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body: { is_read?: boolean } = await req.json().catch(() => ({}));
    const isRead = body.is_read !== false;
    await sql`UPDATE contact_messages SET is_read = ${isRead} WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const id = await getId(ctx);
    if (id === null) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await sql`DELETE FROM contact_messages WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}