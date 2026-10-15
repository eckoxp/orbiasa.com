import { sql } from '@/lib/db';

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

export const RATE_LIMIT_WINDOW_SECONDS = WINDOW_MINUTES * 60;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
}

async function ensureLoginTable() {
  await sql`CREATE TABLE IF NOT EXISTS login_attempts (
    id bigserial PRIMARY KEY,
    ip text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  );`;
  await sql`CREATE INDEX IF NOT EXISTS login_attempts_ip_created_idx ON login_attempts (ip, created_at);`;
}

export async function isBlocked(ip: string): Promise<boolean> {
  await ensureLoginTable();
  const rows = (await sql`
    SELECT count(*)::int AS n FROM login_attempts
    WHERE ip = ${ip} AND created_at > now() - make_interval(mins => ${WINDOW_MINUTES});
  `) as Record<string, unknown>[];
  return Number(rows[0]?.n ?? 0) >= MAX_FAILURES;
}

export async function recordFailure(ip: string): Promise<void> {
  await sql`INSERT INTO login_attempts (ip) VALUES (${ip});`;
  await sql`DELETE FROM login_attempts WHERE created_at < now() - interval '1 day';`;
}

export async function clearFailures(ip: string): Promise<void> {
  await sql`DELETE FROM login_attempts WHERE ip = ${ip};`;
}