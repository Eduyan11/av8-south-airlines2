const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomToken(length = 24): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += CHARS[bytes[i] % CHARS.length];
  return out;
}

export function bookingRef(): string {
  return `AV8-${randomToken(6)}`;
}
