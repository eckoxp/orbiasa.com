import { NextResponse } from 'next/server';

type LoginBody = { password?: string };

export async function POST(req: Request) {
  const body: LoginBody = await req.json().catch(()=>({}));
  const password = String(body?.password || '');
  const expected = process.env.ADMIN_PASSWORD || 'Admin@123$';
  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_auth', '1', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*8 });
  return res;
}


