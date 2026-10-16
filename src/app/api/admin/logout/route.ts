import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // The cookie is httpOnly, so it can only be cleared from the server.
  res.cookies.set('admin_auth', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
  return res;
}