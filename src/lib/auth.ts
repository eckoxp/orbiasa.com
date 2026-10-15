const encoder = new TextEncoder();
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expires}.${await hmac(String(expires), secret)}`;
}

export async function verifySessionToken(token?: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || !(Number(expires) > Date.now())) return false;
  const expected = await hmac(expires, secret);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}