import { NextResponse } from "next/server";
import { createSessionToken, SESSION_MAX_AGE } from '@/lib/auth';
import { getClientIp, isBlocked, recordFailure, clearFailures, RATE_LIMIT_WINDOW_SECONDS } from '@/lib/rateLimit';
type LoginBody = { password?: string };

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }

  const ip = getClientIp(req);
  try {
    if (await isBlocked(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) } }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const body: LoginBody = await req.json().catch(() => ({}));
  const password = String(body?.password || '');

  if (password !== expected) {  
    await recordFailure(ip).catch(() => undefined);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await clearFailures(ip).catch(() => undefined);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_auth', await createSessionToken(), {
    httpOnly: true, sameSite: 'lax', secure: false, path: '/', maxAge: SESSION_MAX_AGE,
  });
  return res;
}